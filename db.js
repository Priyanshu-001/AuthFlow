const mongoose = require('mongoose')
const { Schema } = mongoose
//db connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true,autoIndex: false }).catch(e=>{
  console.log('saw err'+ e)
})
//userSchema and Model
const userSchema = new Schema({
  'name': String,
  'role': {'type': String, enum: ['recruiter', 'tester','other']},
  'authMode': {'type': String, 'default':'phone', enum:['phone', 'email']},

  'phone': {'type':String},
  
  'status': {'type': String,'default': 'creation', enum: ['creation','active','suspended']}
})

const User = mongoose.model('User',userSchema)

//Used by create in api.js used to add details of user
const UserInit = (id,update)=>{
return new Promise((resolve,reject)=>{
  User.findOneAndUpdate({'_id':id},{status: 'active', name:update.name, role:update.role},{new: true})
  .then(data=>resolve(data))
  .catch(err=>reject(err))
 
})


}
//used in 
const findOrCreate = (user1)=>{
  
return new Promise((resolve,reject)=>{
  User.findOne(user1,(err,data)=>{
    if(err) console.log('goooooo'+err)
    if(data===null)
    {  newUser = new User({...user1,'status': 'creation'})
    newUser.save(err=>{if(err)
                  reject(err)
                  else
                  resolve(newUser)
                })
    
   
    }
    else{
      console.log('found entry')
    resolve(data)
    }
  })
 
}

)

}
exports.findOrCreate = findOrCreate
exports.UserInit = UserInit