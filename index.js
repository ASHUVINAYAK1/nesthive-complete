// import http from "http";
// import {random} from "./feature.js";
// console.log(random());



// const server = http.createServer((req,res) =>{
//     if (req.url === "/about" ){
//         res.end("<h1>ABOUT PAGE</h1>")
//     }
// });

// server.listen(5000,() =>{
//     console.log("server is working");
// })

import fs from 'fs';
import { env } from 'process';
import  express  from "express";
import path from "path";
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import Jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { name } from 'ejs';
import Stripe from 'stripe';

mongoose.connect("mongodb://localhost:27017",{
    dbName: "backend",
}).then(()=> console.log('database connected')).catch((e)=>console.log(e));

const userschema = new mongoose.Schema({
    name: String,
    email:String,
    password:String,
    event:String,
    package:String,
});

const user = mongoose.model("loginUsers",userschema);


const app = express();


//middleware
app.use(express.static(path.join(path.resolve(),"public")));
app.use(express.urlencoded({extended : true}));
app.use(cookieParser());
app.use(express.static(path.join(path.resolve(), 'public')));


// setting up view engine
app.set("view engine","ejs");

const isAuhanticated = async (req,res,next) =>{
    const { token } = req.cookies;
    if(token){

        const decode = Jwt.verify(token,"abcdef")
        req.User = await user.findById(decode._id);

        next();

    }
    else{
         res.redirect("login");
    }


};

app.get("/", isAuhanticated, (req,res) =>{
    res.render("home",{name:req.User.name});
});
app.get("/login", (req,res) =>{
    res.render("login");
});
app.get("/success", (req,res) =>{
    res.render("a");
});
app.get("/about", (req,res) =>{
    res.render("about");
});
app.get("/register", (req,res) =>{
    res.render("register");
});
app.get("/education", (req,res) =>{
    res.render("education");
})
app.post("/login", async (req, res) => {
    try {
      const { email, password } = req.body;
  
      const retrievedUser = await user.findOne({ email });
  
      if (!retrievedUser) {
        return res.redirect("/register"); 
      }
  
      const match = await bcrypt.compare(password, retrievedUser.password);
  
      if (!match) {
        return res.render("login", { message: "Incorrect Username/Password" });
      }
  
      const token = Jwt.sign({ _id: retrievedUser._id }, "abcdef");
  
      res.cookie("token", token, {
        httpOnly: true,
        expires: new Date(Date.now() + 60 * 1000000)
      });
  
      res.redirect("/");
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).send('Internal Server Error');
    }
  });
  
app.post("/register",async(req,res)=>{
    const { name,email,password} = req.body;

    let User = await user.findOne({ email });
    if(User){
        return res.redirect("/login");
    }

    const hashpass = await bcrypt.hash(password,10);

    User = await user.create({
        name,
        email,
        password: hashpass,
        event:'',
        package:'',

    });
    
    const token = Jwt.sign({_id: User._id}, "abcdef");

    res.cookie("token",token,{
        httpOnly: true,
        expires: new Date(Date.now() + 60*100000)
    })
    res.redirect("/");
})


app.get("/home",(req,res)=>{
    const events = document.getElementById('events')
        events.addEventListener('change',function(){
            const test = events.value;

            if(test=== 'corporate'){
                console.log('in corporate');
            }
        })
})
app.get("/corporate", (req,res) =>{
    res.render("corporate");
});
app.get("/payment",(req,res)=>{
  res.render("payment");
})
app.post("/corporate_premium", async (req, res) => {
    try {
      const { token } = req.cookies;
  
      if (token) {
        const decoded = Jwt.verify(token, "abcdef");
        const userId = decoded._id;
  
        const existingUser = await user.findById(userId);
  
        if (existingUser) {
          const updatedUser = await user.updateOne(
            { _id: userId },
            { $set: { event: 'corporate event', package: 'premium ' } }
          );
          res.redirect('/payment');
        } else {
          console.log('User not found');
          res.status(404).send('User not found');
        }
      } else {
        console.log('Token not found');
        res.status(401).send('Unauthorized');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).send('Internal Server Error');
    }
  });
  
  app.post("/corporate_standard", async (req, res) => {
    try {
        const { token } = req.cookies;
    
        if (token) {
          const decoded = Jwt.verify(token, "abcdef");
          const userId = decoded._id;
    
          const existingUser = await user.findById(userId);
    
          if (existingUser) {
            const updatedUser = await user.updateOne(
              { _id: userId },
              { $set: { event: 'corporate event', package: 'standard ' } }
            );
            res.redirect('/payment');
          } else {
            console.log('User not found');
            res.status(404).send('User not found');
          }
        } else {
          console.log('Token not found');
          res.status(401).send('Unauthorized');
        }
      } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).send('Internal Server Error');
      }
  });
  app.post("/corporate_basic", async (req, res) => {
    try {
        const { token } = req.cookies;
    
        if (token) {
          const decoded = Jwt.verify(token, "abcdef");
          const userId = decoded._id;
    
          const existingUser = await user.findById(userId);
    
          if (existingUser) {
            const updatedUser = await user.updateOne(
              { _id: userId },
              { $set: { event: 'corporate event', package: 'basic ' } }
            );
            res.redirect('/payment');
          } else {
            console.log('User not found');
            res.status(404).send('User not found');
          }
        } else {
          console.log('Token not found');
          res.status(401).send('Unauthorized');
        }
      } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).send('Internal Server Error');
      }
  });
  
  
  
  

app.get("/party", (req,res) =>{
    res.render("party");
});
app.post("/party_premium", async (req, res) => {
    try {
        const { token } = req.cookies;
    
        if (token) {
          const decoded = Jwt.verify(token, "abcdef");
          const userId = decoded._id;
    
          const existingUser = await user.findById(userId);
    
          if (existingUser) {
            const updatedUser = await user.updateOne(
              { _id: userId },
              { $set: { event: 'party event', package: 'premium ' } }
            );
            res.redirect('/payment');
          } else {
            console.log('User not found');
            res.status(404).send('User not found');
          }
        } else {
          console.log('Token not found');
          res.status(401).send('Unauthorized');
        }
      } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).send('Internal Server Error');
      }
  });
  app.post("/party_standard", async (req, res) => {
    try {
      const { token } = req.cookies;
  
      if (token) {
        const decoded = Jwt.verify(token, "abcdef");
        const userId = decoded._id;
  
        const existingUser = await user.findById(userId);
  
        if (existingUser) {
          const updatedUser = await user.updateOne(
            { _id: userId },
            { $set: { event: 'party event', package: 'standard ' } }
          );
          res.redirect('/payment');
        } else {
          console.log('User not found');
          res.status(404).send('User not found');
        }
      } else {
        console.log('Token not found');
        res.status(401).send('Unauthorized');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).send('Internal Server Error');
    }
  });
  app.post("/party_basic", async (req, res) => {
    try {
        const { token } = req.cookies;
    
        if (token) {
          const decoded = Jwt.verify(token, "abcdef");
          const userId = decoded._id;
    
          const existingUser = await user.findById(userId);
    
          if (existingUser) {
            const updatedUser = await user.updateOne(
              { _id: userId },
              { $set: { event: 'party event', package: 'basic ' } }
            );
            res.redirect('/payment');
          } else {
            console.log('User not found');
            res.status(404).send('User not found');
          }
        } else {
          console.log('Token not found');
          res.status(401).send('Unauthorized');
        }
      } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).send('Internal Server Error');
      }
  });

app.get("/wedding", (req,res) =>{
    res.render("wedding");
});
app.post("/wedding_premium", async (req, res) => {
    try {
        const { token } = req.cookies;
    
        if (token) {
          const decoded = Jwt.verify(token, "abcdef");
          const userId = decoded._id;
    
          const existingUser = await user.findById(userId);
    
          if (existingUser) {
            const updatedUser = await user.updateOne(
              { _id: userId },
              { $set: { event: 'wedding event', package: 'premium ' } }
            );
            res.redirect('/payment');
          } else {
            console.log('User not found');
            res.status(404).send('User not found');
          }
        } else {
          console.log('Token not found');
          res.status(401).send('Unauthorized');
        }
      } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).send('Internal Server Error');
      }
  });
  app.post("/wedding_standard", async (req, res) => {
    try {
        const { token } = req.cookies;
    
        if (token) {
          const decoded = Jwt.verify(token, "abcdef");
          const userId = decoded._id;
    
          const existingUser = await user.findById(userId);
    
          if (existingUser) {
            const updatedUser = await user.updateOne(
              { _id: userId },
              { $set: { event: 'wedding event', package: 'standard ' } }
            );
            res.redirect('/payment');
          } else {
            console.log('User not found');
            res.status(404).send('User not found');
          }
        } else {
          console.log('Token not found');
          res.status(401).send('Unauthorized');
        }
      } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).send('Internal Server Error');
      }
  });
  app.post("/wedding_basic", async (req, res) => {
    try {
        const { token } = req.cookies;
    
        if (token) {
          const decoded = Jwt.verify(token, "abcdef");
          const userId = decoded._id;
    
          const existingUser = await user.findById(userId);
    
          if (existingUser) {
            const updatedUser = await user.updateOne(
              { _id: userId },
              { $set: { event: 'wedding event', package: 'basic ' } }
            );
            res.redirect('/payment');
          } else {
            console.log('User not found');
            res.status(404).send('User not found');
          }
        } else {
          console.log('Token not found');
          res.status(401).send('Unauthorized');
        }
      } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).send('Internal Server Error');
      }
  });
  // education apis
  app.post("/education_premium", async (req, res) => {
    try {
        const { token } = req.cookies;
    
        if (token) {
          const decoded = Jwt.verify(token, "abcdef");
          const userId = decoded._id;
    
          const existingUser = await user.findById(userId);
    
          if (existingUser) {
            const updatedUser = await user.updateOne(
              { _id: userId },
              { $set: { event: 'education event', package: 'premium ' } }
            );
            res.redirect('/payment');
          } else {
            console.log('User not found');
            res.status(404).send('User not found');
          }
        } else {
          console.log('Token not found');
          res.status(401).send('Unauthorized');
        }
      } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).send('Internal Server Error');
      }
  });
  app.post("/education_standard", async (req, res) => {
    try {
        const { token } = req.cookies;
    
        if (token) {
          const decoded = Jwt.verify(token, "abcdef");
          const userId = decoded._id;
    
          const existingUser = await user.findById(userId);
    
          if (existingUser) {
            const updatedUser = await user.updateOne(
              { _id: userId },
              { $set: { event: 'education event', package: 'standard ' } }
            );
            res.redirect('/payment');
          } else {
            console.log('User not found');
            res.status(404).send('User not found');
          }
        } else {
          console.log('Token not found');
          res.status(401).send('Unauthorized');
        }
      } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).send('Internal Server Error');
      }
  });
  app.post("/education_basic", async (req, res) => {
    try {
        const { token } = req.cookies;
    
        if (token) {
          const decoded = Jwt.verify(token, "abcdef");
          const userId = decoded._id;
    
          const existingUser = await user.findById(userId);
    
          if (existingUser) {
            const updatedUser = await user.updateOne(
              { _id: userId },
              { $set: { event: 'education event', package: 'basic ' } }
            );
            res.redirect('/payment');
          } else {
            console.log('User not found');
            res.status(404).send('User not found');
          }
        } else {
          console.log('Token not found');
          res.status(401).send('Unauthorized');
        }
      } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).send('Internal Server Error');
      }
  });

app.get("/logout",(req,res)=>{
    res.cookie("token",null,{
        httpOnly: true,
        expires: new Date(Date.now())
    })
    res.redirect("/");
})
// method

// Your existing code...

const stripeSecretKey = 'sk_test_51OOfstSFJ7Aq1ZGW4KboqF6NlztgEMUwCZw9gBC6JtDAV425cAzVQff1Rmzr1M7rliJx6WHxTyiNPf9OEeRHeBgK00MFJbfI0B'; // Use your Stripe secret key
// console.log(stripeSecretKey)
const stripe = Stripe(stripeSecretKey);


const createCustomer = async () => {
  try {
    // Create a new customer
    const customer = await stripe.customers.create({
      email: 'example@example.com', 
    });
    console.log('Customer created:', customer.id);
    return customer.id;
  } catch (error) {
    console.error('Error creating customer:', error);
    throw error;
  }
};

const createPaymentMethod = async () => {
  try {
    // Create a PaymentMethod
    const paymentMethod = await stripe.paymentMethods.create({
      type: 'card',
      card: {
        token: 'tok_visa', // Use a test token provided by Stripe
      },
    });
    console.log('Payment method created:', paymentMethod.id);
    return paymentMethod.id;
  } catch (error) {
    console.error('Error creating payment method:', error);
    throw error;
  }
};

const attachPaymentMethodToCustomer = async (customerID, paymentMethodID) => {
  try {
    // Attach the PaymentMethod to the customer
    await stripe.paymentMethods.attach(paymentMethodID, {
      customer: customerID,
    });
    console.log('Payment method attached to customer:', paymentMethodID);
  } catch (error) {
    console.error('Error attaching payment method to customer:', error);
    throw error;
  }
};

// Express route to handle charge
app.post('/charge', async (req, res) => {
  try {
    // Create a customer and get the customer ID
    const customerID = await createCustomer();

    // Create a PaymentMethod
    const paymentMethodID = await createPaymentMethod();

    // Attach the PaymentMethod to the customer
    await attachPaymentMethodToCustomer(customerID, paymentMethodID);
    res.redirect("/success");
    // Now, you can proceed with creating a PaymentIntent using the attached PaymentMethod
    // ...
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500)
  }
});


app.listen(5001,()=>{
    console.log('server is working')
});
