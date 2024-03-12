const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const z = require('zod');

const User = require('../models/User');

const userSchema = z.object({
    name: z.string().trim(4, { message: "Enter a valid name" }),
    email: z.string().email({ message: "Enter a valid email" }),
    password: z.string().min(4, { message: "Password should be atleast 4 characters." }),
    remember_me: z.boolean()
});

const registerUser = async (req, res) => {
    let userData = req.body;
    try {
        userData = await userSchema.parseAsync(userData);
    } catch (err) {
        return res.status(400).json({ message: err.message });
    }

    const { name, email, password } = userData;

    const userExists = await User.findOne({ email });
    if (userExists) {
        return res.status(400).json({ message: 'Email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
        return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(400).json({ message: 'Invalid email or password' });
    }
    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '24h' });

    res.json({ token });
};


module.exports = { registerUser, loginUser };