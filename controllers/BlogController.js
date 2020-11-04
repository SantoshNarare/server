const Blog = require("../models/BlogModal");
const { body, validationResult } = require("express-validator");
const { sanitizeBody } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
const auth = require("../middlewares/jwt");
var mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);

// Blog Schema
function BlogData(data) {
	this.id = data._id;
	this.title = data.title;
	this.description = data.description;
	this.createdAt = data.createdAt;
}

/**
 * Blog List.
 * 
 * @returns {Object}
 */
exports.blogList = [
	auth,
	(req, res) => {
		try {
			Blog.find().sort({ createdAt: -1 }).then((blogs) => {
				if (blogs.length > 0) {
					return apiResponse.successResponseWithData(res, "Operation success", blogs);
				} else {
					return apiResponse.successResponseWithData(res, "Operation success", []);
				}
			});
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];

/**
 * Blog Detail.
 * 
 * @param {string} id
 * 
 * @returns {Object}
 */
exports.blogDetail = [
	auth,
	(req, res) => {
		if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
			return apiResponse.successResponseWithData(res, "Operation success", {});
		}
		try {
			Blog.findOne({ _id: req.params.id }).then((blog) => {
				if (blog !== null) {
					let blogData = new BlogData(blog);
					return apiResponse.successResponseWithData(res, "Operation success", blogData);
				} else {
					return apiResponse.successResponseWithData(res, "Operation success", {});
				}
			});
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];

/**
 * create Blog.
 * 
 * @param {string}      title 
 * @param {string}      description
 * 
 * @returns {Object}
 */
exports.createBlog = [
	auth,
	body("title", "Title must not be empty.").isLength({ min: 1 }).trim(),
	body("description", "Description must not be empty.").isLength({ min: 1 }).trim(),
	sanitizeBody("*").escape(),
	(req, res) => {
		try {
			const errors = validationResult(req);
			var blog = new Blog(
				{
					title: req.body.title,
					user: req.user,
					description: req.body.description,
				});

			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}
			else {
				//Save Blog.
				blog.save((err) => {
					if (err) { return apiResponse.ErrorResponse(res, err); }
					let blogData = new BlogData(blog);
					return apiResponse.successResponseWithData(res, "Blog add Success.", blogData);
				});
			}
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];

/**
 * Blog update.
 * 
 * @param {string}      title 
 * @param {string}      description
 * 
 * @returns {Object}
 */
exports.blogUpdate = [
	auth,
	body("title", "Title must not be empty.").isLength({ min: 1 }).trim(),
	body("description", "Description must not be empty.").isLength({ min: 1 }).trim(),
	sanitizeBody("*").escape(),
	(req, res) => {
		try {
			const errors = validationResult(req);
			var blog = new Blog(
				{
					title: req.body.title,
					description: req.body.description,
					_id: req.params.id
				});

			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}
			else {
				if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
					return apiResponse.validationErrorWithData(res, "Invalid Error.", "Invalid ID");
				} else {
					Blog.findById(req.params.id, (err, foundBlog) => {
						if (foundBlog === null) {
							return apiResponse.notFoundResponse(res, "Blog not exists with this id");
						} else {
							//Check authorized user
							if (foundBlog.user.toString() !== req.user._id) {
								return apiResponse.unauthorizedResponse(res, "You are not authorized to do this operation.");
							} else {
								//update blog.
								Blog.findByIdAndUpdate(req.params.id, blog, {}, (err) => {
									if (err) {
										return apiResponse.ErrorResponse(res, err);
									} else {
										let blogData = new BlogData(blog);
										return apiResponse.successResponseWithData(res, "Blog update Success.", blogData);
									}
								});
							}
						}
					});
				}
			}
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];

/**
 * Blog Delete.
 * 
 * @param {string} id
 * 
 * @returns {Object}
 */
exports.blogDelete = [
	auth,
	function (req, res) {
		if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
			return apiResponse.validationErrorWithData(res, "Invalid Error.", "Invalid ID");
		}
		try {
			Blog.findById(req.params.id, (err, foundBlog) => {
				if (foundBlog === null) {
					return apiResponse.notFoundResponse(res, "Blog not exists with this id");
				} else {
					//Check authorized user
					if (foundBlog.user.toString() !== req.user._id) {
						return apiResponse.unauthorizedResponse(res, "You are not authorized to do this operation.");
					} else {
						//delete blog.
						Blog.findByIdAndRemove(req.params.id, (err) => {
							if (err) {
								return apiResponse.ErrorResponse(res, err);
							} else {
								return apiResponse.successResponse(res, "Blog delete Success.");
							}
						});
					}
				}
			});
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];