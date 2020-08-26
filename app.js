var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var methodOverride = require('method-override');
var expressSanitizer = require("express-sanitizer")

//mongoose.connect("mongodb://localhost/restful_blog_app",{useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true });//{ useNewUrlParser: true });
var url = process.env.DATABASEURL || "mongodb+srv://wogara:Quaresma7!@cluster0-tsjiz.mongodb.net/test?retryWrites=true&w=majority";
mongoose.connect(url,{
    useNewUrlParser:true,
    useCreateIndex:true
}).then(()=>{
    console.log("connected to db");
}).catch(err => {
    console.log("ERROR: ",err.message);
});
app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));
app.use(expressSanitizer());
app.use(methodOverride("_method"));

var blogSchema = new mongoose.Schema({
	title: String,
	image: String,
	body: String,
	created: {type:Date,default:Date.now}
})

var Blog = mongoose.model("Blog",blogSchema);

//home page
app.get("/",function(req,res){
	res.redirect("/blogs");
})

//index
app.get("/blogs",function(req,res){
	Blog.find({},function(err,blogs){
		if (err){
			console.log(err);
		}else{
			res.render("index",{blogs:blogs});
		}
	});
})


//new route
app.get("/blogs/new",function(req,res){
	res.render("new");
})

//create route
app.post("/blogs",function(req,res){
	//create blog
	req.body.blog.body = req.sanitize(req.body.blog.body);
	Blog.create(req.body.blog,function(err,newBlog){
		if(err){
			console.log(err);
		}else{
			res.redirect("/blogs");
		}

	})

})


//Show Route
app.get("/blogs/:id",function(req,res){
	Blog.findById(req.params.id,function(err,foundBlog){
		if(err){
			res.redirect("/blogs");
		}else{
			res.render("show",{blog:foundBlog});
		}

	})
})

//edit/update route
app.get("/blogs/:id/edit",function(req,res){

	req.body.blog.body = req.sanitize(req.body.blog.body);
	Blog.findById(req.params.id,function(err,foundBlog){
		if(err){
			console.log("there was an error");
			res.redirect("/blogs");
		}else{
			res.render("edit",{blog:foundBlog});
		}
	})
})

//update route
app.put("/blogs/:id",function(req,res){
	Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err,updatedBlog){
		if (err){
			res.redirect("/blogs");
		}else{
			res.redirect("/blogs/"+req.params.id);
		}
	});
});


//delete route
app.delete("/blogs/:id",function(req,res){
	Blog.findByIdAndRemove(req.params.id,function(err){
		if(err){
			res.redirect("/blogs");
		}else{
			res.redirect("/blogs");
		}
	})
})
// Blog.create({
// 	title: "check blog",
// 	image: "https://i.ytimg.com/vi/2Twtsm6roa8/hqdefault.jpg",
// 	body: "this is a fake blog to check my app"
// });


app.listen(process.env.PORT || 3000,function(){
	console.log("server is listening");
})
