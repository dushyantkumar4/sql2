const {faker}=require("@faker-js/faker");
const mysql=require("mysql2");
const express=require("express");
const app=express();
const path=require("path");
const methodOverride=require("method-override");
const {v4:uuidv4}=require("uuid");

const port =8080;
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));

app.use(express.static("public"));
app.use(express.static(path.join(__dirname,"public")));
app.use(methodOverride("_method"));
app.use(express.urlencoded({extendet:true}));
app.use(express.json());



const connection=mysql.createConnection({
    host:"localhost",
    user:"root",
    database:"notes_app",
    password:"Velar@6156"
});


let getRandowUser=()=>{
    return [
        faker.string.uuid(),
        faker.internet.username(),
        faker.internet.email(),
        faker.internet.password(),
    ]
}

//CREATE ROUTE
app.get("/user/new",(req,res)=>{
    res.render("new");
});
//Create user
app.post("/user",(req,res)=>{
    let id=uuidv4();
    let {username,email,password}=req.body;
    let q=`INSERT INTO user (id,username,email,password) VALUES ("${id}","${username}","${email}","${password}")`;
    try{
        connection.query(q,(err,result)=>{
            if(err) throw err;
            res.redirect("/user");
        });
    }catch(err){
        console.log(err);
        res.send("there is issue to insert into db ");
    }
});

//delte route
app.get("/user/:id/delete",(req,res)=>{
    let {id}=req.params;
    let q=`SELECT * FROM user WHERE id="${id}"`;
    try{
        connection.query(q,(err,result)=>{
            if(err) throw err;
            let user=result[0];
            res.render("delete",{user});
        });
    }catch(err){
        console.log(err);
        res.send("there is some error in db");
    }
});

// delete user
app.delete("/user/:id",(req,res)=>{
    let {id}=req.params;
    let {password:formPass,email:formEmail}=req.body;
    let q=`SELECT * FROM user WHERE id="${id}"`;
    try{
        connection.query(q,(err,result)=>{
            if (err)throw err;
            let user=result[0];
            if(formPass!=user.password && formEmail!=user.email){
                res.send("Invalid Entry");
            }else{
                let q=`DELETE FROM user WHERE id="${id}" AND email= "${user.email}" `;
                connection.query(q,(err,result)=>{
                    if (err) throw err;
                    res.redirect("/user");
                })
            }
        });
    }catch(err){
        console.log(err);
        res.send("there is some err in db");
    }
});

//edit user
app.get("/user/:id/edit",(req,res)=>{
    let {id}=req.params;
    let q=`SELECT * FROM user WHERE id= "${id}" `;
    try{
        connection.query(q,(err,result)=>{
            if (err) throw err;
            let user=result[0];
            res.render("edit",{user});
        });
    }catch(err){
        console.log(err);
        res.send("there is issue in db");
    }
});
//update user
app.patch("/user/:id",(req,res)=>{
    let {id}=req.params;
    let {password:formpass,username:formuser}=req.body;
    let q=`SELECT * FROM user WHERE id="${id}"`;
    try{
        connection.query(q,(err,result)=>{
            if (err)throw err;
            let user=result[0];
            if(formpass != user.password){
                res.send("wrong password enter corrct password");
            }else{
                let q2=`UPDATE user SET username="${formuser}" WHERE id= "${id}" `;
                    connection.query(q2,(err,result)=>{
                        if(err) throw err;
                        res.redirect("/user");
                    });
            }
        });
    }catch(err){
        console.log(err);
        res.send("there is proble in db");
    }

})

//show users
app.get("/user",(req,res)=>{
    let q=`SELECT * FROM user`;
    try{
        connection.query(q,(err,users)=>{
            if(err) throw err;
            res.render("show.ejs",{users});
        })
    }catch(err){
        console.log(err);
        res.send("there is issue in db");
    }
})
//count users
app.get("/",(req,res)=>{
    let q=`SELECT count(*) FROM user`;
    try{
        connection.query(q,(err,result)=>{
            if (err) throw err;
            let count=result[0]["count(*)"];
            res.render("home",{count});
        })
    }catch(err){
        console.log(err);
    }
});





app.listen(port,()=>{
    console.log(`app is listening on port ${port}`);
})