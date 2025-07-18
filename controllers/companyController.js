const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const createCompany = async (req, res) => {
  const { name, description, location, website, logoUrl } = req.body
  const user = req.user // user is set by auth middleware

  // only employers can create a companies
  if (user.role !== 'EMPLOYER') {
    return res.status(403).json({ error: 'Only employers can create a company profile' })
  }

  try {
    // check if the user already has a company profile
    const existingCompany = await prisma.company.findFirst({
      where : {
        users : {
          some : { id : user.id }
        }
      }
    })

    if (existingCompany) {
      return res.status(409).json({ error: 'You already have a company profile' })
    }

    // create the company profile
    const newCompany = await prisma.company.create({
      data : {
        name,
        description,
        location,
        website,
        logoUrl,
        users : {
          connect : { id : user.id } // connect the company to the user
        }
      }
    })

    // update the user's companyId
    await prisma.user.update({
      where : { id : user.id },
      data : { companyId : newCompany.id }
    })

    return res.status(201).json({
      message: 'Company profile created successfully' })
  } catch (err) {
    console.error('Error creating company:', err)
    return res.status(500).json({ error: 'Something went wrong while creating company profile' })
  }
}


// get user - related company
const getMyCompany = async (req, res) => {
  try {
    // only employers can view their company profile
    if (req.user.role !== 'EMPLOYER') {
      return res.status(403).json({
        error : 'Access denied: Only employers can view company profiles'
      })
    }

    // check if employer has a company profile linked
    const companyId = req.user.companyId
    if (!companyId) {
      return res.status(404).json({
        error : 'No company profile found for this user'
      })
    }

    // fetch the company profile
    const company = await prisma.company.findUnique({
      where : { id : companyId }
    })

    // handle missing company (soft deleted or broken ref)
    if (!company) {
      return res.status(404).json({
        error : 'Company profile not found or no longer active'
      })
    }

    res.status(200).json({ company})
  } catch (err) {
    console.error('Error fetching company:', err)
    return res.status(500).json({ error: 'Something went wrong while fetching company profile' })
  }
}


// update company profile
const updateMyCompany = async (req, res) => {
  try {
    // only employers can update their company profile
    if (req.user.role !== 'EMPLOYER') {
      return res.status(403).json({
        error : 'Access denied: Only employers can update company profiles'
      })
    }

    // check if employer has a company profile linked
    const companyId = req.user.companyId
    if (!companyId) {
      return res.status(404).json({
        error : 'No company profile found for this user'
      })
    }

    // extract fields to update
    const { name, description, location, website, logoUrl, mission, socialLinks } = req.body

    // update the company profile
    const updatedCompany = await prisma.company.update({
      where : { id : companyId },
      data : {
        name,
        description,
        location,
        website,
        logoUrl,
        mission,
        socialLinks
      }
    })

    res.status(200).json({
      message: 'Company profile updated successfully',
      company: updatedCompany
    })
  } catch (err) {
    console.error('Error updating company:', err)
    return res.status(500).json({ error: 'Something went wrong while updating company profile' })
  }
}

// soft-delete or deactivate company profile
const deactivateCompany = async (req, res) => {
  try {
    // only employer can deactivate their company profile
    if (req.user.role !== 'EMPLOYER') {
      return res.status(403).json({
        error : 'Access denied: Only employers can deactivate company profiles'
      })
    }

    // check if employer has a company profile linked
    const companyId = req.user.companyId
    if (!companyId) {
      return res.status(404).json({
        error : 'No company profile found for this user'
      })
    }

    // flip isActive to false
    const updatedCompany = await prisma.company.update({
      where : { id : companyId },
      data : { isActive : false }
    })

    res.status(200).json({
      message: 'Company profile deactivated successfully',
      company : {
        id : updatedCompany.id,
        name : updatedCompany.name,
        isActive : updatedCompany.isActive
      }
    })
  } catch (err) {
    console.error('Error deactivating company:', err)
    return res.status(500).json({ error: 'Something went wrong while deactivating company profile' })
    
  }
}


// reactivate company profile
const reactivateCompany = async (req, res) => {
  try {
    if (req.user.role !== 'EMPLOYER') {
      return res.status(403).json({
        error : 'Access denied: Only employers can reactivate company profiles'
      })
    }

    const companyId = req.user.companyId
    if (!companyId) {
      return res.status(404).json({
        error : 'No company profile found for this user'
      })
    }

    // fetch the company profile, even if inactive
    const company = await prisma.company.findUnique({
      where : { id : companyId }
    })

    if (!company) {
      return res.status(404).json({
        error : 'Company profile not found'
      })
    }

    // check if already active
    if (company.isActive) {
      return res.status(400).json({
        error : 'Company profile is already active'
      })
    }

    // reactivate the company profile
    const updatedCompany = await prisma.company.update({
      where : { id : companyId },
      data : { isActive : true }
    })

    res.status(200).json({
      message: 'Company profile reactivated successfully',
      company : updatedCompany
    })


  } catch (err) {
    console.error('Error reactivating company:', err)
    return res.status(500).json({ error: 'Something went wrong while reactivating company profile' })
  }
}


module.exports = {
  createCompany,
  getMyCompany,
  updateMyCompany,
  deactivateCompany,
  reactivateCompany
}
