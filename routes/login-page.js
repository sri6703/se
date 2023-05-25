const express = require('express')
const router = express.Router()
const login = require('../models/login')
const jwt = require("jsonwebtoken");
var nodemailer = require("nodemailer");
const bodyParser = require('body-parser');
const bcrypt = require("bcryptjs");
const JWT_SECRET =
  "hvdvay6ert72839289()aiyg8t87qt72393293883uhefiuh78ttq3ifi78272jbkj?[]]pou89ywe";
//getting all



const app = express();
app.set('view engine', 'ejs');
router.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

router.get('/',async (req,res) => {
    try {
        const logindet = await login.find()
        res.json(logindet)
    } catch (err) {
        res.status(500).json({message: err.message})
    }
}) 

//getting one
router.get('/:regno', getloginByRegno, async (req, res) => { 
  try {
    const user = await login.findOne({ regno: req.params.regno });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json({ regno: user.regno, name: user.name, email: user.email, phoneno: user.phoneno, 
               address: user.address, gender: user.gender});
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error.' });
  }
});


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

/*router.get('/:regno/:pwd', getlogin, async (req,res) => {
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
});*/

//updating one
router.patch('/:regno', getlogin, async (req, res) => {
  let message = '';

  if (req.body.name != null) {
    res.logindet.name = req.body.name;
    message = 'name';
  }

  if (req.body.email != null) {
    res.logindet.id = req.body.email;
    message = 'email';
  }


  if (req.body.address != null) {
    res.logindet.address = req.body.address;
    message = 'address';
  }

  // Additional parameters
  if (req.body.phoneno != null) {
    res.logindet.phoneno = req.body.phoneno;
    message = 'phone number';
  }

  

  if (req.body.gender != null) {
    res.logindet.gender = req.body.gender;
    message = 'gender';
  }

  try {
    const updatedlogin = await res.logindet.save();
    res.json({ message: `${message} updated successfully.` });
  } catch (err) {
    
    res.status(400).json({ message: err.message });
  }
});

//change password
router.patch('/:regno/:pwd', getlogin, checkPwd, async (req, res) => {
  try {
    const newPassword = req.body.newpwd;
    // Retrieve the user based on regno
    const user = await login.findOne({ regno: req.params.regno });
    // Update the password
    user.pwd = newPassword;

    // Save the updated user
    await user.save();

  } catch (err) {
    console.error('Error updating password:', err);
    console.log(newPassword);
    alert(err);
    return res.status(500).json({ message: 'Failed to update password' });
  }
});

//deleting one
router.delete('/:regno', getlogin, async (req, res) => {
    
    try {
      const user = await login.findOne({ regno: req.params.regno });
      const deletepwd  = req.body.delpwd;
    // Check if the provided password matches the user's stored password
    if ( deletepwd != user.pwd) {
      return res.status(401).json({ message: "incorrect pwd"});
    }
    else{
      // Use the rollno parameter to delete the user account
      await res.logindet.deleteOne({ regno: req.params.regno });
      res.json({ message: "Deleted user" });
    }
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });


//forgot password sending a mail code 
router.post("/:email", async (req, res) => {
  const { email } = req.params;
  try {
    const oldUser = await login.findOne({ email });
    if (!oldUser) {
      return res.json({ status: "User Not Exists!!" });
    }
    const secret = JWT_SECRET + oldUser.pwd;
    const token = jwt.sign({ email: oldUser.email, id: oldUser._id }, secret, {
      expiresIn: "5m",
    });
    const link = `http://localhost:4201/login-page/${oldUser._id}/${token}`;
    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "inirs3076@gmail.com",
        pass: "wrakfhflxvcfsxay",
      },
    });

    var mailOptions = {
      from: "inirs3076@gmail.com",
      to: email,
      subject: "Password Reset",
      text: link,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
    console.log(link);
  } catch (error) { }
});


router.get("/:id/:token", async (req, res) => {
  const { id, token } = req.params;
  console.log(req.params);
  const oldUser = await login.findOne({ _id: id });
  if (!oldUser) {
    return res.json({ status: "User Not Exists!!" });
  }
  const secret = JWT_SECRET + oldUser.pwd;
  try {
    const verify = jwt.verify(token, secret);
    res.render("index", { email: verify.email, id: id, token: token, status: "Not Verified" });
  } catch (error) {
    res.send("Not Verified");
  }
});


router.post("/:id/:token", async (req, res) => {
  const { id, token } = req.params;
  const { password } = req.body;
  // Rest of your code
  const oldUser = await login.findOne({ _id: id });
  if (!oldUser) {
    return res.json({ status: "User Not Exists!!" });
  }
  const secret = JWT_SECRET + oldUser.pwd;
  try {
    const verify = jwt.verify(token, secret);
    await login.updateOne(
      {
        _id: id,
      },
      {
        $set: {
          pwd: password,
        },
      }
    );

    res.render("index", { email: verify.email, id: id, token: token, status: "verified" });
  } catch (error) {
    console.log(error);
    res.json({ status: "Something Went Wrong" });
  }
});



//forgot password sending a mail code 

/*
  //updating pwd for forgot pwd
  async function checkPwd(req, res) {
    try {
      // Check if the user with the provided email exists
      const user = await login.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }
  
      // Check if the current password meets the criteria
      const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+~`-]).{8,}$/;
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
  
      return res.status(200).json({ message: "Password updated successfully" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
  */
//updating pwd for edit profile
async function checkPwd(req, res,next) {
  try {
    // Check if the user with the provided email exists
    const currentPassword = req.params.pwd;
    const newPassword = req.body.newpwd;
    const confPassword = req.body.confpwd;
    const user = await login.findOne({ regno: req.params.regno });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    //check if new-pwd and conf-pwd are same
    if (newPassword !== confPassword) {
      return res.status(400).json({ message: "New password and confirmed password do not match." });
}


    // Check if the current password meets the criteria
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+~`-]).{8,}$/;
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
      logindet = await login.findOne({ regno: req.params.regno })
      if(logindet == null) {
        return res.status(404).json({message: "cannot find user"})
      }
    } catch (err) {
        return res.status(500).json({message:err.message})
    }


    res.logindet = logindet
    next()
}
async function getloginByRegno(req, res, next) {
  let logindet;
  try {
    logindet = await login.findOne({ regno: req.params.regno });
    if (logindet == null) {
      return res.status(404).json({ message: "Cannot find user" });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }

  res.logindet = logindet;
  next();
}


module.exports = router