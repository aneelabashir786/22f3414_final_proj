const User = require('../model/User');
const bcrypt = require('bcrypt'); // Use only bcrypt (not bcryptjs)

exports.signup = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  try {
      const hashed = await bcrypt.hash(password, 10);
      const user = new User({ 
          firstName, 
          lastName, 
          email: email.toLowerCase(), // Normalize email
          password: hashed 
      });
      await user.save();
      res.json({ 
          success: true, 
          message: 'Signup successful',
          user: { firstName, lastName, email }
      });
  } catch (err) {
      res.status(400).json({ 
          success: false,
          error: err.message 
      });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ 
        email: email.toLowerCase() // Case-insensitive search
    });
    
    if (!user) {
      return res.status(401).json({ 
          success: false, 
          message: 'Invalid credentials' // Generic message
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ 
          success: false, 
          message: 'Invalid credentials' // Same message
      });
    }

    res.json({ 
        success: true,
        message: 'Login successful',
        user: {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email
        }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ 
        success: false, 
        message: 'Server error' 
    });
  }
};