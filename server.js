require('dotenv').config();
const express = require('express');
const alert=require('alert')
const ejsLayouts = require('express-ejs-layouts');
const app = express();
const axios=require('axios');
const { response } = require('express');
const db = require('./models')
const flash=require('connect-flash')
const session=require('express-session')
const methodOverride=require('method-override')
// Sets EJS as the view engine
app.set('view engine', 'ejs');
// Specifies the location of the static assets folder
app.use(express.static('static'));
// Sets up body-parser for parsing form data
app.use(express.urlencoded({ extended: false }));
// Enables EJS Layouts middleware
app.use(ejsLayouts);
require('dotenv').config()
const API_KEY=process.env.API_KEY
// Adds some logging to each request
app.use(require('morgan')('dev'));
app.use(session({
  secret: 'secret',
  cookie:{maxAge: 6000},
  resave:false,
  saveUninitialized:false
}))
app.use(flash())
app.use(methodOverride('_method'))
// Routes
app.get('/', function(req, res) {
  res.render('index')
});

app.get('/results',(req,res)=>{
  axios.get(`http://www.omdbapi.com/?apikey=${API_KEY}&s=${req.query.SearchText}`)
  .then(response=>{
    let dataJson=response.data.Search
    
    //res.send(dataJson)
    let message=req.flash('message')
    let search=req.query.SearchText
    res.render('results',{response:dataJson,message:message,search:search})
  })
})
app.get('/movies/:movie_id',(req,res)=>{
  axios.get(`http://www.omdbapi.com/?apikey=${API_KEY}&i=${req.params.movie_id}`)
  .then(response=>{
    //res.send(response.data)
    let alert=req.flash('message')
    res.render('detail.ejs',{data:response.data,message:alert})
  })

})

app.post('/:title/:movie_id',(req,res)=>{
let bolCreated=false
let message
  db.fave.findOrCreate({
    where:{

      title:req.params.title,
      imbid:req.params.movie_id
    }
  }).then(([movieFave,waasCreated])=>{
     db.fave.findAll().then(faves=>{
    if(waasCreated){
      req.flash('message','save successfuly')   
    }else{
      req.flash('message','It is already aadded')
    }
    let search=req.body.SearchText
    res.redirect('/results/?SearchText=' + search);
  })
  })
})
app.post('/details/:title/:movie_id',(req,res)=>{
  let bolCreated
  let message
    db.fave.findOrCreate({
      where:{
  
        title:req.params.title,
        imbid:req.params.movie_id
      }
    }).then(([movieFave,waasCreated])=>{

     if(waasCreated){
       req.flash('message','save successfuly')
    
     }else{
       req.flash('message','It is already aadded')
     }
    let search=`/movies/${req.params.movie_id}`
     res.redirect(search);
    })
  })

app.get('/AllFaves',(req,res)=>{
  db.fave.findAll().then(response=>{
    res.render('allFave.ejs',{faves:response})

    //res.send(response)
  })
})
// The app.listen function returns a server handle
var server = app.listen(process.env.PORT || 3000);

// We can export this server to other servers like this
module.exports = server;

app.delete('/faves/:imbid/:title',(req,res)=>{
  db.fave.destroy({
    where:{
      title:req.params.title,
      imbid:req.params.imbid
    }
  }).then(response=>{
    res.redirect('/AllFaves')
  })
})