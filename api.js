const { Sequelize, DataTypes } = require("sequelize");
const nodemailer = require("nodemailer");
const db = require("./connection");
const Products = db.Mobile;
const ProductPage = db.Product;
const Categories = db.Categories;
const Customer = db.Customer;
const SingleProduct = db.SingleProduct;
const Order = db.Order;
const OrderDetail = db.OrderDetail;
const secretkey = "Secretkey";
const jwt = require("jsonwebtoken");
const Watch = db.Watch;

//Add Mobiles
const PostData = async (req, res) => {
  try {
    const {
      Img,
      Model,
      Brand,
      Price,
      Ram,
      Rom,
      Camera,
      Battery,
      Product_Type,
      CategoryId,
      count,
    } = req.body;

    const newProduct = await Products.create({
      Img,
      Model,
      Brand,
      Price: parseFloat(Price),
      Ram,
      Rom,
      Camera,
      Battery,
      Product_Type,
      CategoryId,
      count,
    });

    res.status(201).json({ success: true, data: newProduct });
  } catch (error) {
    console.error("Error in PostData:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

//Add SingleProduct
const Singledata = async (req, res) => {
  const { Img, Price, Product_Type, Model, count } = req.body;
  const data = await SingleProduct.create({
    Img,
    Price,
    Product_Type,
    Model,
    count,
  });
  res.status(201).json({ success: true, data: data });
};

//Add Products
const items = async (req, res) => {
  const { Img, Price, Product_Type, count } = req.body;
  const data = await ProductPage.create({
    Img,
    Price,
    Product_Type,
    count,
  });
  res.status(201).json({ success: true, data: data });
};

//Add Watches
const PostWatch = async (req, res) => {
  try {
    const {
      Img,
      Model,
      Brand,
      Price,
      Battary_Time,
      Battery,
      Product_Type,
      CategoryId,
      count,
    } = req.body;

    const newProduct = await Watch.create({
      Img,
      Model,
      Brand,
      Price: parseFloat(Price),
      Battary_Time,
      Battery,
      Product_Type,
      CategoryId,
      count,
    });

    res.status(201).json({ success: true, data: newProduct });
  } catch (error) {
    console.error("Error in PostData:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

//Add Categories In Table
const PostCategory = async (req, res) => {
  try {
    const { CategoryName } = req.body;

    const newProduct = await Categories.create({
      CategoryName,
    });

    res.status(201).json({ success: true, data: newProduct });
  } catch (error) {
    console.error("Error in PostData:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

//Get All Data API
const Getdata = async (req, res) => {
  const data = await Products.findAll({});
  res.status(200).json({ data });
};
//Get productPage Data
const GetProductPage = async (req, res) => {
  const data = await ProductPage.findAll({});
  res.status(200).json({ data });
};
//Get All Single Data
const HomeProduct = async (req, res) => {
  const data = await SingleProduct.findAll({});
  res.status(200).json({ data });
};

//Customer Data API
const PostCustomer = async (req, res) => {
  var body = req.body;
  console.log(req.body);
  let data_final = {
    email: body?.email,
    password: body?.password,
  };
  const data = await Customer.create(data_final);
  res.status(200).json({ message: "Successfully Sign", success: true });
};
const LoginCustomer = async (req, res) => {
  try {
    const { email, password } = req.body;

    const customer = await Customer.findOne({ where: { email } }); // renamed user -> customer for clarity

    if (!customer) {
      return res
        .status(403)
        .json({ message: "Auth failed: wrong email", success: false });
    }
    if (customer.password !== password) {
      return res
        .status(403)
        .json({ message: "Auth failed: wrong password", success: false });
    }

    console.log("Logging in customer:", customer.id, customer.email);

    const payload = { id: customer.id, email: customer.email };
    const jwtToken = jwt.sign(payload, secretkey, { expiresIn: "10s" });

    return res.status(200).json({
      message: "Login Successful",
      success: true,
      jwtToken,
      user: {
        id: customer.id,
        email: customer.email,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

//Relation API to Category
const Watchdata = async (req, res) => {
  const WatchWithCategory = await Categories.findOne({
    where: { id: 1 }, // use an existing watch ID
    include: db.Watch,
  });
  res.status(201).json({ data: WatchWithCategory });
};

//Realtion API to Category
const Mobiledata = async (req, res) => {
  try {
    const categories = await Categories.findAll({
      where: {
        id: [1, 2],
      },
      include: [{ model: db.Mobile }, { model: db.Watch }],
    });

    const cleanedCategories = categories.map((category) => {
      const categoryData = category.toJSON();

      if (
        Array.isArray(categoryData.Mobiles) &&
        categoryData.Mobiles.length === 0
      ) {
        delete categoryData.Mobiles;
      }

      if (
        Array.isArray(categoryData.Watches) &&
        categoryData.Watches.length === 0
      ) {
        delete categoryData.Watches;
      }

      return categoryData;
    });

    res.status(200).json({ data: cleanedCategories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

//Get Category Data By Product Id
const CategoryById = async (req, res) => {
  try {
    const body = req.params.id;
    const categoryIds = body.split(",").filter((id) => !isNaN(id));

    if (categoryIds.length === 0) {
      return res.status(400).json({ error: "No valid category IDs provided" });
    }

    const categories = await Categories.findAll({
      where: { id: categoryIds },
      include: [{ model: db.Mobile }, { model: db.Watch }],
    });

    const cleanedCategories = categories.map((category) => {
      const categoryData = category.toJSON();

      if (
        Array.isArray(categoryData.Mobiles) &&
        categoryData.Mobiles.length === 0
      ) {
        delete categoryData.Mobiles;
      }

      if (
        Array.isArray(categoryData.Watches) &&
        categoryData.Watches.length === 0
      ) {
        delete categoryData.Watches;
      }

      return categoryData;
    });

    res.status(200).json({ data: cleanedCategories });
  } catch (error) {
    console.error("Error fetching category:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const Email = async (req, res) => {
  let TestAccount = await nodemailer.createTestAccount();
  const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    auth: {
      user: "berta72@ethereal.email",
      pass: "XsRjr6QrhRbBxEqNfU",
    },
  });
  const info = await transporter.sendMail({
    from: "Mr.John <kaley75@etherealg@gmail.com>", // Header From:
    to: "Dastgeer <dastgeer33w3@gmail.com>", // Header To:
    subject: "Hello World",
    text: "Hello World",
    html: "<br>Hello World</br>",
  });

  console.log("Message Sent:", info.messageId);
  res.json(info);
};

const createOrder = async (req, res) => {
  try {
    const { customerId, email, cartItems, totalAmount } = req.body;

    if (!customerId || !Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({ error: "Invalid data" });
    }

    const newOrder = await Order.create({
      CustomerId: customerId,
      email,
      total_amount: totalAmount,
    });
    const orderDetails = cartItems.map((item) => ({
      OrderId: newOrder.id,
      quantity: item.count,
    }));

    await OrderDetail.bulkCreate(orderDetails);

    res
      .status(201)
      .json({ message: "Order placed successfully", orderId: newOrder.id });
  } catch (err) {
    console.error("Order error:", err);
    res.status(500).json({ error: "Failed to place order" });
  }
};

const getUserOrders = async (req, res) => {
  try {
    const customerId = req.params.customerId;

    const orders = await Order.findOne({
      where: { CustomerId: customerId },
      include: [
        {
          model: OrderDetail,
          attributes: ["OrderId", "quantity"],
        },
      ],
      order: [["id", "DESC"]],
    });

    res.json(orders);
  } catch (err) {
    console.error("Fetch orders error:", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

module.exports = {
  getUserOrders,
  PostData,
  PostCustomer,
  Getdata,
  LoginCustomer,
  PostCategory,
  PostWatch,
  Mobiledata,
  Watchdata,
  CategoryById,
  Singledata,
  HomeProduct,
  items,
  GetProductPage,
  createOrder,
  Email,
};
