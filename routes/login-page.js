const express = require('express')
const router = express.Router()
const login = require('../models/login')

//getting all
router.get('/',async (req,res) => {
    try {
        const logindet = await login.find()
        res.json(logindet)
    } catch (err) {
        res.status(500).json({message: err.message})
    }
})

//getting one
router.get('/:regno',getlogin, (req,res) => {
    res.json(res.logindet)
})

//creating one
router.post('/', async (req, res) => {
    try {
      const emailExists = await login.findOne({ email: req.body.email })
      if (emailExists) {
        return res.status(201).json({ message: "Email is already registered" })
      }
  
      const logindet = new login({
        name : req.body.name,
        regno : req.body.regno,
        email : req.body.email,
        pwd: req.body.pwd
      })
  
      const newlogin = await logindet.save()
      res.status(201).json({ message: "User created successfully" })
    } catch (err) {
      console.error(err.message)
      res.status(500).json({ message: "Internal server error" })
    }
  })
  



//login
router.get('/:regno/:pwd', getlogin, async (req,res) => {
    try {
        // find the user in the database
        const user = await login.findOne({ regno: req.params.regno });

        // check if user exists and password is correct
        if (user.pwd === req.params.pwd) {
                res.status(200).json({ message: "Access Granted" });
            } else {
                res.status(401).json({ message: "Access Denied" });
            }
        } 
     catch (err) {
        res.status(500).json({ message: err.message });
    }
});


    

//updating one
router.patch('/:regno', getlogin, async (req,res) => {
    let message = '';
    if(req.body.name != null ){
        res.logindet.name=req.body.name;
        message = 'name';
    }
    
    if(req.body.email != null ){
        res.logindet.email=req.body.email;
        message = 'email';
    }

    if(req.body.pwd != null ){
        res.logindet.pwd=req.body.pwd;
        message = 'password';
    }

    try {
        const updatedlogin = await res.logindet.save();
        res.json({ message: `${message} updated successfully.` });
    } catch (err) {
        res.status(400).json({ message: err.message});
    }
});


//deleting one
router.delete('/:email', getlogin, async (req, res) => {
    const { email } = req.params;
    try {
      
      // Use the rollno parameter to delete the user account
      await res.logindet.deleteOne({ email });
      res.json({ message: "Deleted user" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  router.put('/:email/:currentPassword/:newPassword', async (req, res) => {
    const { email,currentPassword, newPassword} = req.params;
  
    try {
      // Call the checkPwd function passing the currentPassword and newPassword
      await checkPwd({ currentPassword, newPassword, email }, res);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  //updating pwd
  async function checkPwd({ currentPassword, newPassword, email }, res) {
    try {
      // Check if the user with the provided email exists
      const user = await login.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }
  
      // Check if the current password meets the criteria
      const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
      if (!passwordRegex.test(currentPassword)) {
        return res.status(400).json({ message: "Current password does not meet the criteria." });
      }
  
      // Check if the user's current password matches the provided current password
      if (user.pwd !== currentPassword) {
        return res.status(400).json({ message: "Current password is incorrect." });
      }
  
      // Check if the new password meets the criteria
      if (!passwordRegex.test(newPassword)) {
        return res.status(400).json({ message: "New password does not meet the criteria." });
      }
  
      // Check if the new password is different from the current password
      if (newPassword === currentPassword) {
        return res.status(400).json({ message: "New password must be different from the current password." });
      }
  
      // Update the password for the user
      user.pwd = newPassword;
      await user.save();
  
      res.json({ message: "Password updated successfully" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
  

async function getlogin(req,res,next) {
    let logindet
    try {
      logindet = await login.findOne({ email: req.params.email })
      if(logindet == null) {
        return res.status(404).json({message: "cannot find user"})
      }
    } catch (err) {
        return res.status(500).json({message: err.message})
    }


    res.logindet = logindet
    next()
}

module.exports = router