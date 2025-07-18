const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// create job controller
const createJob = async (req, res) => {
  const {
    title,
    description,
    location,
    jobType,
    employmentType,
    minSalary,
    maxSalary,
    category,
    tags,
    applicationQuota,
    expiresAt
  } = req.body

  // destructure user from request (set by auth middleware)
  const { id : userId, role, companyId } = req.user

  // check if user is an employer
  if (role !== 'EMPLOYER') {
    return res.status(403).json({ error: 'Only employers can post jobs' })
  }

  // check if the user has created a company profile
  if (!companyId) {
    return res.status(400).json({ error: 'Please create your company profile before posting a job' })
  }

  // validate required fields
  if (!title || !description || !location || !jobType || !employmentType || !category) {
    return res.status(400).json({ error: 'Please fill all required fields' })
  }

  try {
    const newJob = await prisma.job.create({
      data : {
        title,
        description,
        location,
        jobType,
        employmentType,
        minSalary : minSalary ? Number(minSalary) : null,
        maxSalary : maxSalary ? Number(maxSalary) : null,
        category,
        tags,
        applicationQuota : applicationQuota ? Number(applicationQuota) : null,
        expiresAt : expiresAt ? new Date(expiresAt) : null,
        companyId,
        postedById : userId
      }
    })

    return res.status(201).json({ 
      message: 'Job posted successfully',
      job: newJob
     })
  } catch (err) {
    console.error('Job Creation Error:', err)
    return res.status(500).json({ error: 'Something went wrong while creating the job' })
  }
}


// get all jobs (active)
const getAllJobs = async (req, res) => {
  try {
    const jobs = await prisma.job.findMany({
      where : { isActive : true },
      orderBy : { createdAt : 'desc' },
      include : {
        company : {
          select : {
            name : true,
            logoUrl : true,
            location : true
          }
        }
      }
    })

    res.status(200).json({ jobs })
  } catch (err) {
    console.error('Error fetching jobs:', err)
    return res.status(500).json({ error: 'Something went wrong while fetching jobs' })
  }
}


// get job by ID
const getJobById = async (req, res) => {
  const { id } = req.params

  try {
    const job = await prisma.job.findUnique({
      where : { id },
      include : {
        company : {
          select : {
            name : true,
            logoUrl : true,
            location : true,
            website : true,
            description : true
          }
        },
        postedBy : {
          select : {
            name : true,
            email : true
          }
        }
      }
    })

    if (!job || !job.isActive) {
      return res.status(404).json({ error: 'Job not found or no longer active' })
    }

    res.status(200).json({ job })
  } catch (err) {
    console.error('Error fetching job by ID:', err)
    return res.status(500).json({ error: 'Something went wrong while fetching the job' })
  }
}


// update a job
const updateJob = async (req, res) => {
  const { id : jobId } = req.params
  const { id : userId, role } = req.user

  const {
    title,
    description,
    location,
    jobType,
    employmentType,
    minSalary,
    maxSalary,
    category,
    tags,
    applicationQuota,
    expiresAt
  } = req.body

  if (role !== 'EMPLOYER') {
    return res.status(403).json({ error: 'Only employers can update jobs' })
  }

  try {
    const existingJob = await prisma.job.findUnique({
      where: { id: jobId }
    })

    if (!existingJob || existingJob.postedById !== userId) {
      return res.status(403).json({ error: 'You can only update jobs you posted' })
    }

    const updatedJob = await prisma.job.update({
      where: { id: jobId },
      data: {
        title,
        description,
        location,
        jobType,
        employmentType,
        minSalary: minSalary ? Number(minSalary) : null,
        maxSalary: maxSalary ? Number(maxSalary) : null,
        category,
        tags,
        applicationQuota: applicationQuota ? Number(applicationQuota) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null
      }
    })

    res.status(200).json({
      message: 'Job updated successfully',
      job: updatedJob
    })
  } catch (err) {
    console.error('Job Update Error:', err)
    return res.status(500).json({ error: 'Something went wrong while updating the job' })
  }

}

// deactivate job logic flow:
  // extract the job ID from req.params
  // get userId and role from req.user
  // check if user is an employer
  // find the job by ID
  // ensure:
  //   - job exists
  //  -  job was posted by the user
  // update the job's isActive field to false
const deactivateJob = async (req, res) => {
  const { id: jobId } = req.params
  const { id: userId, role } = req.user

  if (role !== 'EMPLOYER') {
    return res.status(403).json({ error: 'Only employers can deactivate jobs' })
  }

  try {
    const job = await prisma.job.findUnique({
      where : { id : jobId }
    })

    if (!job) {
      return res.status(404).json({ error: 'Job not found' })
    }

    if (job.postedById !== userId) {
      return res.status(403).json({ error: 'You can only deactivate jobs you posted' })
    }

    const updatedJob = await prisma.job.update({
      where : { id : jobId },
      data : { isActive : false }
    })

    res.status(200).json({
      message: 'Job deactivated successfully',
      job: updatedJob
    })
  } catch (err) {
    console.error('Error deactivating job:', err)
    return res.status(500).json({ error: 'Something went wrong while deactivating the job' })
  }
}


// reactivate job logic flow:
  // extract the job ID from req.params
  // get userId and role from req.user
  // check if user is an employer
  // find the job by ID
  // ensure:
  //   - job exists
  //   - job was posted by the user
  // update the job's isActive field to true
const reactivateJob = async (req, res) => {
  const { id: jobId } = req.params
  const { id: userId, role } = req.user

  if (role !== 'EMPLOYER') {
    return res.status(403).json({ error: 'Only employers can reactivate jobs' })
  }

  try {
    const job = await prisma.job.findUnique({
      where: { id: jobId }
    })

    if (!job) {
      return res.status(404).json({ error: 'Job not found' })
    }


    // check if the company is active
    const company = await prisma.company.findUnique({
      where: { id: job.companyId }
    })
    if (!company?.isActive) {
      return res.status(400).json({ error: 'Cannot reactivate job linked to an inactive company' })
    }

    if (job.postedById !== userId) {
      return res.status(403).json({ error: 'You can only reactivate jobs you posted' })
    }

    // check if the job is already active
    if (job.isActive) {
      return res.status(400).json({ error: 'Job is already active' })
    }

    const updatedJob = await prisma.job.update({
      where: { id: jobId },
      data: { isActive: true }
    })

    res.status(200).json({
      message: 'Job reactivated successfully',
      job: updatedJob
    })
  } catch (err) {
    console.error('Error reactivating job:', err)
    return res.status(500).json({ error: 'Something went wrong while reactivating the job' })
  }
}


// get public jobs controller
const getPublicJobs = async (req, res) => {
  const {
    category,
    jobType,
    employmentType,    tags,
    jobLocation,       // this refers to job.location (remote/on-site/etc)
    companyLocation,    // this refers to company.location (e.g., abuja)
    page = 1,
    limit = 10
  } = req.query

  const parsedPage = parseInt(page)
  const parsedLimit = parseInt(limit)
  const skip = (parsedPage - 1) * parsedLimit

  try {
    // build job filters dynamically
    const jobFilters = {
      isActive : true,
      ...(category && { category }),
      ...(jobType && { jobType }),
      ...(employmentType && { employmentType }),
      ...(jobLocation && { location: jobLocation }),
      ...(tags && { tags: { contains: tags, mode: 'insensitive' } }) // supports partial match
    }

    // build company filters dynamically
    const companyFilters = {
      isActive : true,
      ...(companyLocation && { location : companyLocation })
    }

    // count total jobs for pagination
    const totalJobs = await prisma.job.count({
      where : {
        ...jobFilters,
        company : {
          ...companyFilters
        }
      }
    })

    const jobs = await prisma.job.findMany({
      where : {
        ...jobFilters,
        company: {
          ...companyFilters
        }
      },
      skip,
      take : parsedLimit,
      include: {
        company: {
          select: {
            name: true,
            location: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    const totalPages = Math.ceil(totalJobs / parsedLimit)

    res.status(200).json({ 
      jobs,
      meta : {
        page : parsedPage,
        limit : parsedLimit,
        totalPages,
        totalJobs
      }
     })
  } catch (err) {
    console.error('Error fetching public jobs:', err)
    return res.status(500).json({ error: 'Something went wrong while fetching public jobs' })
  }
}


module.exports = {
  createJob,
  getAllJobs,
  getPublicJobs,
  getJobById,
  updateJob,
  reactivateJob,
  deactivateJob
}



