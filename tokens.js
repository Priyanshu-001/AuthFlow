const jwt = require('jsonwebtoken')

function getJWT(payload){
return jwt.sign(payload,process.env.secret,{expiresIn: '2h'})
}
//checkJWT is a middleWare it edits req.user
function checkJWT(req, res, next) {
  let token
if(req.cookies.authorization){
   token = req.cookies.authorization.split(' ')[1]}
else{
 req.user={}
 return next()
}

  
 

  jwt.verify(token, process.env.secret, (err, user) => {

    if (err) 
    res.clearCookie('authorization')
    req.user = user
    console.log('Token out'+ user)

    next()
  })
  
}
exports.getJWT = getJWT
exports.checkJWT = checkJWT