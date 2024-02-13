const express = require('express');
const bodyParser = require('body-parser')
const fs = require('fs')
const app = express();
const cors = require('cors');

// Sample data from the JSON files
const dishesData = require('./Dishes.json');
const restaurantsData = require('./Restaurant.json');

app.use(cors());
app.use(bodyParser.json())

app.get('/', (req, res) => {
  res.json('Welcome')
})

// API endpoint to get all dishes
app.get('/api/dishes', (req, res) => {
  res.json(dishesData);
});

// API endpoint to get all restaurants
app.get('/api/restaurants', (req, res) => {
  res.json(restaurantsData);
});

app.get('/api/restaurants/:id', (req, res) => {
  const restaurantId = parseInt(req.params.id);
  const restaurant = restaurantsData.restaurants.filter(restaurant =>
    restaurant.resid === restaurantId
  );

  if (restaurant) {
    res.json({restaurant});
  } else {
    res.status(404).json({ message: 'Restaurant not found' });
  }
});

// API endpoint to search for dishes and restaurants by name
app.get('/api/search', (req, res) => {
    const searchTerm = req.query.q.toLowerCase();
    const matchingRestaurants = [];
  
    // Search for dishes
    const matchingDishes = dishesData.dishes.filter(dish =>
      dish.dishname.toLowerCase().includes(searchTerm)
    );
  
    // If dishes are found, find restaurants serving those dishes
    if (matchingDishes.length > 0) {
      matchingDishes.forEach(dish => {
        restaurantsData.restaurants.forEach(restaurant => {
          restaurant.rescuisines.forEach(cuisine => {
            Object.entries(cuisine).forEach(([cuisineType, dishIds]) => {
              if (dishIds.includes(dish.dishid)) {
                matchingRestaurants.push(restaurant);
              }
            });
          });
        });
      });
    } else {
      // If no dishes are found, search for restaurants by name
      const restaurantsByName = restaurantsData.restaurants.filter(restaurant =>
        restaurant.name.toLowerCase().includes(searchTerm)
      );
      matchingRestaurants.push(...restaurantsByName);
    }
  
    res.json({ restaurants: matchingRestaurants });
  });
  
// API endpoint for user signup
app.post('/api/signup',(req, res) => {
  try {
    const email = req.body.email ;
    const password = req.body.password;
    // Load existing user data from the JSON file
    let users = [];
    if (fs.existsSync('users.json')) {
      users = JSON.parse(fs.readFileSync('users.json', 'utf8'));
    }

    // Check if user already exists
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Add new user to the array
    users.push({ email, password });

    // Save updated user data to the JSON file
    fs.writeFileSync('users.json', JSON.stringify(users));

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Server error' });
  }
});

// API endpoint for user login
app.post('/api/login', (req, res) => {
  try {
    const { email, password } = req.body;

    // Load users from the JSON file
    const users = JSON.parse(fs.readFileSync('users.json', 'utf8'));

    // Find user by email
    const user = users.find(user => user.email === email);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if password matches
    if (user.password !== password) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    // Authentication successful
    res.json({ message: 'Login successful' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
