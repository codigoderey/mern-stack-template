const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');

const User = require('../../models/User');

// @route           GET api/users
// @description     Test route
// @access          Public

router.post(
  '/',
  // validation using express-validator
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'A valid email is required').isEmail(),
    check(
      'password',
      'Password is required with at least 6 characters length'
    ).isLength({ min: 6 }),
  ],
  async (req, res) => {
    // validation implemented
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // see if user exists
    const { name, email, password } = req.body;

    try {
      let user = await User.findOne({ email });

      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'User already exists' }] });
      }

      // get users gravatar based on their email
      const avatar = gravatar.url(email, {
        s: '200',
        r: 'pg',
        default: 'mm',
      });

      // create user
      user = new User({
        name,
        email,
        password,
        avatar,
      });

      // encrypt password using bcrypjs
      const salt = await bcrypt.genSalt(10);

      user.password = await bcrypt.hash(password, salt);

      // save the user
      await user.save();

      // return json web token
      const payload = {
        user: {
          id: user._id,
        },
      };

      jwt.sign(
        payload,
        config.get('jwtSecret'),
        {
          expiresIn: '24h',
        },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (error) {
      console.log(error.message);
    }
  }
);

module.exports = router;
