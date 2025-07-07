const router = require('express').Router();
const passport = require('passport');

router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }), 
  (req, res) => {
    req.session.save(() => {
      res.redirect('/api/debug/session');
    });
  }
);

router.get('/logout', (req, res) => {
    req.logout(err => {
        if (err) { return next(err); }
        res.send('Você foi deslogado.');
    });
});

module.exports = router;