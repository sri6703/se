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
router.delete('/:regno', getlogin, async (req,res) => {
    try {
        await res.logindet.deleteOne()
        res.json({ message: "deleted user"})
    } catch (err) {
        res.status(500).json({message: err.message})
    }
})

async function getlogin(req,res,next) {
    let logindet
    try {
      logindet = await login.findOne({ regno: req.params.regno })
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