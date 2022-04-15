var express = require('express');
var app = express();
var router=require('express').Router();
var exec = require('child_process').exec;
const UPLOAD_PATH = './uploads'
var cors = require('cors');
var sys = require('sys')
var multer  = require('multer')
var upload = multer()
const fs = require('fs');
const bodyParser = require('body-parser')
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.get('/', function (req, res) {
  res.send('Hello World!');
})

app.use(express.static('public'))

app.post('/upload',upload.array('videos',2) ,function (req, res, next) {
  const files  = req.files
  const result = new Promise((resolve, reject) => {
    files.map((v,index) => {
	id=Date.now()
        fs.writeFile(`/share/jobs/${id}_${index + 1}`, v.buffer, function(err,data) {
		console.log("write video")
		fs.readFile('/share/joblist.json',function(er,data){
			list=JSON.parse(data)
			newjob = {
				"id" : id,
				"state" : 0 
			}
			list.jobs.push(newjob)
			var listString = JSON.stringify(list)
			fs.writeFile("/share/joblist.json",listString,function(err,data){
				if(err){
					console.log(err)
				}
			})
	 })
          if (err)  reject(err);
          resolve("succeed");
        })
    })
  })
result.then(r => {
    res.json({
      msg: r,
    })
  }).catch(err => {
    res.json({ err })
  });
})

app.get('/delete/:id',function(req,res){
	fs.readFile('/share/joblist.json',function(err,list){
		if(err!==null)console.log(err)
		
		jobs=JSON.parse(list).jobs
		var i=0;
		while(jobs[i]){

			if (jobs[i].id===req.params.id)
			{
				console.log(jobs[i].id)
				jobs.splice(i,1);
				break;
			}
			i++;
		}
		var w={"jobs" : jobs}
		
		console.log(w)
		
		fs.writeFile('/share/joblist.json',JSON.stringify(w),function(e){
			if(e)console.log(e)
		})
		
		res.send(w)
	})

})





app.get('/ult', function (req, res, next) {
	
    exec('sudo top -bn 1 -i -c', function (err, stdout, stderr) {
    sys.print('stdout: ' + stdout);
    sys.print('stderr: ' + stderr);
	console.log(stdout);
    //    res.send(stdout);
	     if (err !== null) {
    console.log('exec error: ' + err);
  }
	fs.readFile('/share/node1.json',function(error,info1){
		if(error!==null){
			console.log(error)
		}
		fs.readFile('/share/node2.json',function(err,info2){
			if(err!==null){
				console.log(err)
			}
			fs.readFile('/share/joblist.json',function(er,info3){
			if(er!==null)console.log(er)
				var out ={
					"node1" : JSON.parse(info1).jobId,
					"node2" : JSON.parse(info2).jobId,
					"jobs" : JSON.parse(info3).jobs,
					"top" : stdout
				}
				res.send(out)
			})
		})
		
    });

	})
});


app.listen(80, function () {
  console.log(`Example app listening on port ${80}`);
});
