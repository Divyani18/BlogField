if(process.env.NODE_ENV != "production"){
	require("dotenv").config({path: __dirname + '/.env'});
}

const dburl = process.env.DB_URL;

var express          = require("express"),
	app              = express(),
	path		 = require("path"),
	bodyParser       = require("body-parser"),
	mongoose         = require("mongoose"),
	methodOverride   = require("method-override"),
    expressSanitizer = require("express-sanitizer");

//App config
mongoose.connect(dburl, {useNewUrlParser: true, useUnifiedTopology: true})
.then(() => {
	console.log("DB CONNECTED!");
})
.catch(err => {
	console.log("OOPS! Error ocurred in connecting to mongo!");
	console.log(err);
});
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.use(express.static("public"));
app.use(methodOverride("_method"));

//Mongoose schema, model
var blogSchema = new mongoose.Schema({
	title: String,
	image: String,
	body: String,
	created: {type: Date, default: Date.now}
});

var Blog = mongoose.model("Blog", blogSchema);

//Routes
app.get("/", function(req, res){
	res.redirect("/blog");
});

app.get("/blog", function(req, res){
	Blog.find({}, function(err, blogs){
		if(err){
			console.log(err);
		}else{
			res.render("index", {blogs: blogs});
		}
	});
	
});

app.get("/blog/new", function(req, res){
	res.render("new");
});

app.post("/blog", function(req, res){

	req.body.blog.body = req.sanitize(req.body.blog.body);

	Blog.create(req.body.blog, function(err, newBlog){
		if(err){
			res.render("/blog/new");
		}else{
			res.redirect("/blog");
		}
	});
});

app.get("/blog/:id", function(req, res){
	var foundBlog = req.params.id;
	Blog.findById(foundBlog, function(err, foundBlog){
		if(err){
			res.redirect("/blog");
		}else{
			res.render("show", {blog: foundBlog});
		}
	});
});

app.get("/blog/:id/edit", function(req, res){
	Blog.findById(req.params.id, function(err, editBlog){
		if(err){
			res.redirect("/blog");
		}else{
			res.render("edit", {blog: editBlog})}
	});
});

app.put("/blog/:id", function(req, res){
	req.body.blog.body = req.sanitize(req.body.blog.body);
	Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
		if(err){
			res.redirect("/blog");
		}else{
			res.redirect("/blog/" + req.params.id);
		}
	});
});

app.delete("/blog/:id", function(req, res){
	Blog.findByIdAndRemove(req.params.id, function(err){
		if(err){
			res.redirect("/blog");
		}else{
			res.redirect("/blog");
		}
	});
});

const port = process.env.PORT || 3000;
app.listen(port, function(){
	console.log("Server is running!!!");
});
