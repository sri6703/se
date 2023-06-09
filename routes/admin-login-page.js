const express = require('express');
const router = express.Router();
const AdminLogin = require('../models/admin-login');
const bodyParser = require('body-parser');


const app = express();
app.set('view engine', 'ejs');
router.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

router.get('/',async (req,res) => {
    try {
        const logindet = await AdminLogin.find()
        res.json(logindet)
    } catch (err) {
        res.status(500).json({message: err.message})
    }
})

//getting one
router.get('/:email',getlogin, (req,res) => {
    res.json(res.logindet)
})

//creating one
router.post('/:name/:email/:pwd', async (req, res) => {
    try {
      const emailExists = await AdminLogin.findOne({ email: req.params.email });
      if (emailExists) {
        return res.status(201).json({ message: "Email is already registered" });
      }
  
      const logindet = new AdminLogin({
        name: req.params.name,
        email: req.params.email,
        pwd: req.params.pwd,
      });
  
      const newlogin = await AdminLogindet.save();
      res.status(201).json({ message: "User created successfully" });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
//login though form
/*
router.post('/:name/:email/:pwd', async (req, res) => {
  try {
    const emailExists = await AdminLogin.findOne({ email: req.body.email });
    if (emailExists) {
      return res.status(201).json({ message: "Email is already registered" });
    }

    const logindet = new AdminLogin({
      name: req.body.name,
      email: req.body.email,
      pwd: req.body.pwd,
    });

    const newlogin = await logindet.save();
    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Internal server error" });
  }
});
*/

//updating one
router.patch('/:email', getlogin, async (req,res) => {
    let message = '';
    const user = await AdminLogin.findOne({ email: req.params.email });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    if(req.body.name != null ){
        user.name=req.body.name;
        message = 'name';
    }

    if(req.body.pwd != null ){
        user.pwd=req.body.pwd;
        message = 'password';
    }

    try {
        const updatedlogin = await user.save();
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





//forgot password sending a mail code 
router.post("/:email", async (req, res) => {
  const { email } = req.params;
  try {
    const oldUser = await AdminLogin.findOne({ email });
    if (!oldUser) {
      return res.json({ status: "User Not Exists!!" });
    }
    const secret = JWT_SECRET + oldUser.pwd;
    const token = jwt.sign({ email: oldUser.email, id: oldUser._id }, secret, {
      expiresIn: "5m",
    });
    const link = `http://localhost:4201/admin-login-page/${oldUser._id}/${token}`;
    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "inirs3076@gmail.com",
        pass: "wrakfhflxvcfsxay",
      },
    });

    var mailOptions = {
      from: "inirs3076@gmail.com",
      to: "srini6703@gmail.com",
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
  const oldUser = await AdminLogin.findOne({ _id: id });
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
  const oldUser = await AdminLogin.findOne({ _id: id });
  if (!oldUser) {
    return res.json({ status: "User Not Exists!!" });
  }
  const secret = JWT_SECRET + oldUser.pwd;
  try {
    const verify = jwt.verify(token, secret);
    await AdminLogin.updateOne(
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


  //updating pwd
  async function checkPwd({ currentPassword, newPassword, email }, res) {
    try {
      // Check if the user with the provided email exists
      const user = await AdminLogin.findOne({ email });
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
  
      res.json({ message: "Password updated successfully" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
  

async function getlogin(req,res,next) {
    let logindet
    try {
      logindet = await AdminLogin.findOne({ email: req.params.email })
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