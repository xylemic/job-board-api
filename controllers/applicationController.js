const { PrismaClient } = require('@prisma/client')
const { application } = require('express')
const prisma = new PrismaClient()

const applyToJob = async (req, res) => {
  const { id : jobId } = req.params
  const { resumeUrl, coverLetter } = req.body
  const { id : userId, role } = req.user

  if (role !== 'APPLICANT') {
    return res.status(403).json({ error: 'Only applicants can apply to jobs' })
  }

  try {
    const job = await prisma.job.findUnique({
      where : { id : jobId },
      select : { isActive : true }
    })

    if (!job || !job.isActive) {
      return res.status(404).json({ error: 'Job not found or not accepting applications' })
    }

    // check if user has already applied to this job
    const existingApplication = await prisma.application.findFirst({
      where: {
        jobId,
        userId
      }
    })

    if (existingApplication) {
      return res.status(409).json({ error: 'You have already applied to this job' })
    }

    const newApplication = await prisma.application.create({
      data : {
        resumeUrl,
        coverLetter,
        jobId,
        userId
      }
    })

    return res.status(201).json({
      message : 'Application submitted successfully',
      application : newApplication
    })
  } catch (err) {
    console.error('Error applying to job:', err)
    return res.status(500).json({ error: 'Something went wrong while applying to the job' })
    
  }
}


// get my applications controller
const getMyApplications = async (req, res) => {
  const { id : userId, role } = req.user

  if (role !== 'APPLICANT') {
    return res.status(403).json({
      error: 'Only applicants can view their applications'
    })
  }

  try {
    const applications = await prisma.application.findMany({
      where : { userId },
      include : {
        job : {
          select : {
            title : true,
            location : true,
            company : {
              select : {
                name : true
              }
            }
          }
        }
      },
      orderBy : {
        appliedAt : 'desc'
      }
    })

    res.status(200).json({ applications })
  } catch (err) {
    console.error('Error fetching applications:', err)
    return res.status(500).json({ error: 'Something went wrong while fetching applications' })
  }
}


// logic to get applicants for a job
  // extract jobId from request params
  // extract employer's userId from req.user
  // check if user is an employer
  // find the job by jobId
  // check if the job exists and is posted by the employer
  // fetch applications for the job
    // - include applicant details (name, email. resumeUrl, etc)
  // return the applications with job details
const getApplicantsForJob = async (req, res) => {
  const { id : jobId } = req.params
  const { id : userId, role } = req.user

  if (role !== 'EMPLOYER') {
    return res.status(403).json({
      error: 'Only employers can view applicants for jobs'
    })
  }

  try {
    const job = await prisma.job.findUnique({
      where : { id : jobId },
      select : { postedById : true }
    })

    if (!job) {
      return res.status(404).json({ error: 'Job not found' })
    }

    if (job.postedById !== userId) {
      return res.status(403).json({ error: 'You can only view applicants for jobs you posted' })
    }

    const applications = await prisma.application.findMany({
      where : { jobId },
      include : {
        user : {
          select : {
            id : true,
            name : true,
            email : true,
            resumeUrl : true,
            bio : true
          }
        }
      },
      orderBy : { appliedAt : 'desc' }
    })

    res.status(200).json({ applicants : applications })
  } catch (err) {
    console.error('Error fetching applicants:', err)
    return res.status(500).json({ error: 'Something went wrong while fetching applicants' })
  }
}


const updateApplicationStatus = async (req, res) => {
  const { id : applicationId } = req.params
  const { status } = req.body
  const { id : userId, role } = req.user

  if (role !== 'EMPLOYER') {
    return res.status(403).json({ error: 'Only employers can update application status' })
  }

  const validStatuses = ['PENDING', 'ACCEPTED', 'REJECTED']
  const normalizedStatus = status.toUpperCase()
  if (!validStatuses.includes(normalizedStatus)) {
      return res.status(400).json({ error: 'Invalid status. Must be pending, accepted, or rejected' })
    }

    try {
      const application = await prisma.application.findUnique({
        where : { id : applicationId },
        include : {
          job : {
            select : {
              postedById : true
            }
          }
        }
      })

      if (!application) {
        return res.status(404).json({ error: 'Application not found' })
      }

      if (application.job.postedById !== userId) {
        return res.status(403).json({ error: 'You can only update applications for jobs you posted' })
      }

      const updatedApplication = await prisma.application.update({
        where : { id : applicationId },
        data : { status : normalizedStatus }
      })

      res.status(200).json({
         message: 'Application status updated successfully',
         application: updatedApplication
         })
    } catch (err) {
      console.error('Error updating application status:', err)
      return res.status(500).json({ error: 'Something went wrong while updating application status' })
    }
}

module.exports = {
  applyToJob,
  getMyApplications,
  getApplicantsForJob,
  updateApplicationStatus
}

