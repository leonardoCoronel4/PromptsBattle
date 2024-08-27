var mongoose = require('mongoose');
//mongoose.connect('mongodb://elusuario:prueba123456@cluster0.rbxbx.mongodb.net/myFirstDatabase', { useMongoClient: true });
mongoose.connect(process.env.mongodb, { useNewUrlParser: true });
//mongoose.connect('mongodb://elusuario:prueba123456@ds227322.mlab.com:27322/prueba', { useMongoClient: true });
//mongoose.connect('mongodb+srv://elusuario:prueba123456@cluster0.mpp8l.mongodb.net/prueba', { useMongoClient: true });