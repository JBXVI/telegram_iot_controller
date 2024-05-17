const express = require("express");
const router = express.Router();
const path = require("path");
const crypto = require("./Crypto")
const htmlSample = require("./htmlSample")
require("dotenv").config()

const KEY = process.env.KEY;
const PASSWORD = process.env.PASSWORD;
const EMAIL = process.env.EMAIL;


module.exports =(userSchema,Middleware,transporter)=>{
    //login page
    router.get('/login',(req,res)=>{
        //login/signup html page
        res.sendFile(path.join(__dirname,'..','Public','login.html'));
    });

    //register
    router.post('/register',async(req,res)=>{
        let body = req.body;
        if(body.username && body.email && body.password){
            try{
                //check if user already exists
                const user = await userSchema.findOne({$or:[{email:req.body.email},{username:req.body.username}]}).exec()
                if(user){
                    //if user exists
                    res.json({"success":false,"error":"user exists"})
                }else{
                    //if user doesn't exists
                    try{
                        //new user model
                        const newUser = new userSchema({
                            username:req.body.username,
                            email:req.body.email,
                            password:req.body.password,
                            isVerified:false,
                            verificationCode:"",
                            premiumUser:false,
                            emailLimit:0,
                            joinDate:new Date(),
                            maxDevices:5,
                            
                        });
                        await newUser.save(); //save to database
                        res.json({"success":true});//send success response
                    }catch(e){
                        res.json({"success":false,"error":""})
                    }
                }
            }
            catch(e){
                res.json({"success":false,"error":""})
            }
        }else{
            res.json({"success":false,"error":"insufficient credentials"})
        }
    });

    //login
    router.post('/login',async(req,res)=>{
        console.log(req.body.email , req.body.password)
        if(req.body.email && req.body.password){
            const user = await userSchema.findOne({$and:[{email:req.body.email},{password:req.body.password}]}).exec()
            if(user){
                req.session.user = user;
                res.json({"success":true})

            }else{
                res.json({"success":false,"error":"incorrect email or password"})
            }
        }else{
            res.json({"success":false,"error":"insufficient Credentials"})
        }
    });

    //control panel page
    router.get('/',Middleware,(req,res)=>{
        res.sendFile(path.join(__dirname,'..','Public','start.html'));
    })

    //check if username exists
    router.post('/checkusername',async(req,res)=>{
        if(req.body.username && req.body.username !=""){
            const user = await userSchema.findOne({username:req.body.username}).exec()
            if(user){
                res.json({"available":false})
            }else{
                res.json({"available":true})
            }
        }
    })

    //generate token
    router.post('/generateToken',Middleware,async(req,res)=>{
        try{
            let username = req.session.user.username
            let email = req.session.user.email;
            
            const data = await userSchema.findOne({email:email,username:username}).exec()
            if(data){
                    let html = htmlSample
                    let maxDevices = data.maxDevices;
                    let UserEmail = data.email;
                    let adminToken = crypto.Encrypt(`{"uname":"${username}","password":"${PASSWORD}","admin":true}`,KEY)
                    let adminTokenHTML  = `<div class="input-group mb-3"><span class="input-group-text" id="basic-addon3">TOKEN</span>&nbsp;&nbsp;-&nbsp;&nbsp;<input type="text" class="form-control" id="basic-url" aria-describedby="basic-addon3" value="${adminToken}" disabled></div><br><br><h1 style='font-family: "Poetsen One", sans-serif;'>Devices</h1><br>`
                   
                    let deviceTokensHTML = ``
                    for(i=1;i<=maxDevices;i++){
                        let clientName = `_client${i}@${username}`
                        let tokenModel =  crypto.Encrypt(`{"uname":"${clientName}","ref":"${username}"}`,KEY);
                        deviceTokensHTML+=`<div class="input-group mb-3"><span class="input-group-text" id="basic-addon3">${clientName}</span>&nbsp;&nbsp;-&nbsp;&nbsp;<input type="text" class="form-control" id="basic-url" aria-describedby="basic-addon3" value="${tokenModel}" disabled></div>`
                    }
                    
                    html = html.replace("--data--",adminTokenHTML+deviceTokensHTML)
                    
                    let mailOptions = {
                        from: EMAIL, // Sender's email address
                        to: UserEmail, // List of recipients
                        subject: 'Controller Token', // Subject line
                        text: 'Token is ready!!', // Plain text body
                        html: html // HTML body
                    };
                    // Send the email
                    transporter.sendMail(mailOptions, (error, info) => {
                        if (error) {
                            res.json({"success":false,"Error":error})
                        }
                        res.json({"success":true})
                    });
                    console.log(email)
                    
                    
            }else{
                console.log("no data")
            }
        }catch(e){
            console.log(e)
        }
        
    });

   

    //for all other routes
    router.get('*',(req,res)=>{
        res.send("hey!")
    })


    return router;
}