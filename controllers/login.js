var express = require('express');
var passport = require('passport');

var router = express.Router();

router.get('/', function (req, res) {
    res.render('login/index', {
        errorMessages: req.flash('error')
    });
});

router.post('/', passport.authenticate('local', {
    successRedirect: '/receptek/list',
    failureRedirect: '/login',
    failureFlash: true,
    badRequestMessage: 'Hiányzó adatok'
}));

router.get('/regisztracio', function (req, res) {
    res.render('login/regisztracio', {
        errorMessages: req.flash('error')
    });
});
router.post('/regisztracio', passport.authenticate('local-signup', {
    successRedirect:    '/receptek/list',
    failureRedirect:    '/login/regisztracio',
    failureFlash:       true,
    badRequestMessage:  'Hiányzó adatok'
}));

module.exports = router;