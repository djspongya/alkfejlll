var express = require('express');

var router = express.Router();

//Viewmodel réteg
var statusTexts = {
    'uj': 'Új',
    'elfogadott': 'Elfogadott',
};
var statusClasses = {
    'new': 'danger',
    'elfogadott': 'success',
};

function decorateReceptek(receptContainer) {
    return receptContainer.map(function (e) {
        e.statusText = statusTexts[e.status];
        e.statusClass = statusClasses[e.status];
        return e;
    });
}

router.get('/szerkeszt/:id', function (req, res) {
    req.app.models.recept.find({ id: req.params.id })
    .then(function (r) {
        //megjelenítés
        res.render('receptek/new', {
            data: r
        });
    })
});

router.get('/new', function (req, res) {
    var validationErrors = (req.flash('validationErrors') || [{}]).pop();
    var data = (req.flash('data') || [{}]).pop();
    
    res.render('receptek/new', {
        validationErrors: validationErrors,
        data: data,
    });
});

// Recept szerkesztese
router.get('/edit/:id', function (req, res) {
    var fId = req.param('id');
    var validationErrors = (req.flash('validationErrors') || [{}]).pop();
    var data = (req.flash('data') || [{}]).pop();
    
    req.app.models.recept.findOne({id: fId}).then(function (recept) {
        res.render('receptek/edit', {
            data: recept
        });
    });
});

router.post('/edit/:id', function (req, res) {
    var fId = req.param('id');
    // adatok ellenőrzése
    req.checkBody('nev', 'Invalid description!').notEmpty().withMessage('Kötelező megadni!');
    //req.sanitizeBody('elkeszites').escape();
    req.checkBody('elkeszites', 'Invalid description!').notEmpty().withMessage('Kötelező megadni!');
    
    var validationErrors = req.validationErrors(true);
    console.log(validationErrors);
    console.log(req.body);
    
    if (validationErrors) {
        // űrlap megjelenítése a hibákkal és a felküldött adatokkal
        req.flash('validationErrors', validationErrors);
        req.flash('data', req.body);
        res.redirect('/receptek/edit/' + fId);
    }
    else {
        // adatok elmentése (ld. később) és a hibalista megjelenítése
        req.app.models.recept.update({id: fId}, {
                nev: req.body.nev,
                elkeszites: req.body.elkeszites,
                status: req.body.status
        })
        .then(function (recept) {
            //siker
            req.flash('info', 'Recept sikeresen szerkesztve!');
            res.redirect('/receptek/list');
        })
        .catch(function (err) {
            //hiba
            console.log(err);
        });
    }
});

router.post('/new', function (req, res) {
    // adatok ellenőrzése
    req.checkBody('nev', 'Invalid description!').notEmpty().withMessage('Kötelező megadni!');
    //req.sanitizeBody('elkeszites').escape();
    req.checkBody('elkeszites', 'Invalid description!').notEmpty().withMessage('Kötelező megadni!');
    
    var validationErrors = req.validationErrors(true);
    console.log(validationErrors);
    console.log(req.body);
    
    if (validationErrors) {
        // űrlap megjelenítése a hibákkal és a felküldött adatokkal
        req.flash('validationErrors', validationErrors);
        req.flash('data', req.body);
        res.redirect('/receptek/new');
    }
    else {
        // adatok elmentése (ld. később) és a hibalista megjelenítése
        req.app.models.recept.create({
            status: 'uj',
            nev: req.body.nev,
            elkeszites: req.body.elkeszites,
            user: req.user,
        })
        .then(function (recept) {
            //siker
            req.flash('info', 'Recept sikeresen beküldve!');
            res.redirect('/receptek/list');
        })
        .catch(function (err) {
            //hiba
            console.log(err);
        });
    }
});

router.get('/list', function (req, res) {
    req.app.models.recept.find().then(function (receptek) {
        console.log(receptek);
        
        //megjelenítés
        res.render('receptek/list', {
            receptek: decorateReceptek(receptek),
            messages: req.flash('info')
        });
    });
});

router.get('/delete/:id', function (req, res) {
    var fId = req.param('id');
    req.app.models.recept.destroy({ id: fId })
    .then(function (recept) {
        req.flash('info', 'Recept sikeresen törölve!');
        res.redirect('/receptek/list');
    })
})

module.exports = router;