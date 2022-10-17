var express = require('express')
var db = require('./db.js')
var router = express.Router()
const id=process.env['ID']
const token = process.env['TWILLIO_TOKEN']
const {getJWT, checkJWT} = require('./tokens')
cookieParser = require('cookie-parser')
const SERVICE = process.env['SERVICE']

var client = require('twilio')(id,token)
router.post('/verify',(req,res)=>{
  console.log("reached")
client.verify.services(SERVICE)
             .verifications
             .create({to: req.body.number, channel: 'sms'})
             .then(verification => {
               console.log(verification.status)
              res.redirect(`/OTP?number=${req.body.number}`);
             })
             .catch(err=>{
               console.log(err)
               return res.send('Invalid number please make sure you have included your country code')
             })

}
)

verifyMiddleware = (req,res,next)=>{
 let otp=''
 for(let i=1; i<7; i++)
 { if(`otp${i}` in req.body &&( parseInt(req.body[`otp${i}`])>=0 && parseInt(req.body[`otp${i}`])<=9 ))
   otp+=req.body[`otp${i}`]
   else
   return res.send('Not a valid request')

 }

 if(req.body.number.length<1)
 return res.send('Not a valid request')
 let payload = {to: '+' + req.body.number, code: otp}
 
  client.verify.services(SERVICE)
             .verificationChecks
             .create(payload)
             
             .then(verification_check =>{ 
            if(verification_check.status==='pending')
            {
              res.send('denied')
            }
            else{
             db.findOrCreate({'phone': payload.to})
             .then(val=>{
                req.user = val
                next()


             }
             )
             .catch(err=>{req.user = null
             next()
             })
            }
             })
             .catch(err=>{console.log(err) 
             req.user =  null
             next()
             })
             
}
router.get('/logout',(req,res)=>{
  res.clearCookie('authorization')
  res.redirect('/?login=1')
})
router.post('/OTP',verifyMiddleware,(req,res)=>{

if(req.user === null)
{
  res.send('Login/Sign up is not working right now. Try agian later or contact')
}
else if(req.user.status!=='deleted' ) {
  let user = req.user.toJSON()
  let TOKEN =getJWT(user)
 
  res.cookie('authorization', `Bearer ${TOKEN}`, { expires: new Date(Date.now() + 86400000 ), httpOnly: true, secure: true });
  res.redirect('/create')
  

}

 
})
router.post('/create',cookieParser(),checkJWT,(req,res)=>{
if(req.user && req.user.status==='creation'){
db.UserInit(req.user._id,{'name': req.body.name,'role': req.body.role}).then( async user=>{
  let U = user.toJSON()
  let TOKEN = await getJWT(U)
  res.clearCookie('authorization')
  res.cookie('authorization', `Bearer ${TOKEN}`, { expires: new Date(Date.now() + 86400000 ), httpOnly: true, secure: true })
  res.redirect('/profile')


})}
else if(req.user && req.user.status==='active')
{
 res.redirect('/profile') 
}
else
{
  res.redirect('/?login=1')
}
})
module.exports=router

