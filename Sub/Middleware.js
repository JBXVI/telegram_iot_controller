const Middleware = (req, res, next) => {
    if(req.path === "/login" || req.path === "/register" || req.path === "/checkusername"){
        if(req.session.user){
            res.redirect('/')
        }else{
            next()
        }
    }else{
        if(req.session.user){
            next();
        }else{
            res.redirect('/login')
        }
    }
    
  };
  
  module.exports = { Middleware };