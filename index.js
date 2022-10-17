const express = require('express');
const app = express();
const port = process.env.port;
const api = require('./api');
const token = require('./tokens');
const { getJWT, checkJWT } = token;
const bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/api', api);
app.use(express.static('Public'));
app.get('/', cookieParser(), checkJWT, (req, res) => {

 let isUser = ( req.user && Object.keys(req.user).length > 0 )
	res.render('home', { user: req.user, 'isUser': isUser });
});
app.get('/OTP',cookieParser(),(req,res)=>{
  if(req.cookies.authorization)
  return res.redirect('/')
  else if(!req.query.number || req.query.number.length<1 )
return res.redirect('/')
console.log(req.query.number);
	res.render('otp', { number: req.query.number });
});
app.get('/create', cookieParser(), checkJWT, (req, res) => {
	if (!req.user) res.redirect('/?login=1');
	if (req.user.status === 'creation') res.render('create', req.user);
	else if (req.user.status === 'active') res.redirect('/profile');
	
	else res.send('Unexpected Error');
});
app.get('/profile', cookieParser(), checkJWT, (req, res) => {
	if (req.user.status === 'active') return res.render('profile', { user: req.user });
	else if(req.user.status === 'creation'){
	  return res.redirect('/create')
	}
	else return res.redirect('/?login=1');
});
let abxy = app.listen(port, () => {});
