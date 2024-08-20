import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { FaMapMarkerAlt, FaFish } from "react-icons/fa";
import { AiOutlineTag } from "react-icons/ai";
import { BiRuler } from "react-icons/bi";
import Button from "@/components/Button";
import Loading from "@/components/Loading";
import useAuth from "@/middleware/auth";
import { API_URL } from "@/config";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";

const nationalityMap: { [key: string]: string } = {
  usa: "us",
  unitedstates: "us",
  uk: "gb",
  england: "gb",
  france: "fr",
  japan: "jp",
  indonesia: "id",
  india: "in",
  // Add more mappings as needed
};

interface Product {
  id: number;
  user_id: number;
  image: string | null;
  price: number;
  qty: number;
  description: string;
  category: string;
  location: string;
  created_at: string;
  updated_at: string | null;
  nationality: string;
  size: string;
}

const FishEditDetail: React.FC = () => {
  useAuth();
  const router = useRouter();
  const { id } = router.query;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return; // Wait for id to be defined

    if (!localStorage.getItem("role")) {
      window.location.href = "/login";
    } else {
      if (localStorage.getItem("role") !== "seller") {
        window.location.href = "/dashboard";
      }
    }

    const fetchProduct = async () => {
      const token = localStorage.getItem("access_token");
      try {
        const response = await fetch(`${API_URL}/products/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: "Bearer " + token,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        setProduct(result || null);
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-12 px-4 flex justify-center items-center h-[calc(100vh-6rem)]">
        <Loading />
      </div>
    );
  }

  if (!product) {
    return <p className="text-center text-gray-500">Product not found</p>;
  }

  const nationality = product.nationality
    ? product.nationality.toLowerCase()
    : "";
  const isoCode = nationalityMap[nationality] || "";
  const flagUrl = isoCode ? `https://flagcdn.com/w40/${isoCode}.png` : null;

  const validationSchema = Yup.object().shape({
    description: Yup.string().required("Description is required"),
    price: Yup.number()
      .required("Price is required")
      .positive("Price must be greater than zero"),
    qty: Yup.number()
      .required("Quantity is required")
      .min(1, "Quantity must be at least 1"),
    category: Yup.string()
      .oneOf(["Local", "Import"])
      .required("Category is required"),
    nationality: Yup.string().required("Nationality is required"),
    location: Yup.string().required("Location is required"),
    size: Yup.string().required("Size is required"),
  });

  const handleEditClick = async (values: any) => {
    console.log("Form values:", values);
    try {
      let fileToUpload = new FormData();
      // if (values.image) {
      //   fileToUpload.append("image", values.image);
      // }
      fileToUpload.append("size", values.size);
      fileToUpload.append("description", values.description);
      fileToUpload.append("location", values.location);
      fileToUpload.append("nationality", values.nationality);
      fileToUpload.append("qty", values.qty.toString());
      fileToUpload.append("price", values.price.toString());
      fileToUpload.append("category", values.category);

      const token = localStorage.getItem('access_token');
      const response = await axios.put(`${API_URL}/products/${id}`,
        fileToUpload, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: "Bearer " + token
        },
      }
      )

      if (response.status === 413) {
        alert("The uploaded file is too large. Please upload a smaller file.");
        return;
      }

      if (!response) {
        alert("Product submission failed!");
        return;
      }

      const result = await response;
      console.log("Product added successfully", result);
      alert("Product added successfully!");
    } catch (error) {
      console.error("Error submitting the form", error);
      alert("An error occurred while adding the product.");
    }
  };

  return (
    <motion.div
      className="container max-w-5xl mx-auto py-12 px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      style={{
        background: "linear-gradient(135deg, #f8f9fa, #e9ecef)",
        borderRadius: "16px",
        boxShadow: "0 8px 30px rgba(0, 0, 0, 0.1)",
      }}
    >
      <button
        onClick={() => router.back()}
        className="bg-gradient-to-r from-blue-500 to-teal-500 text-white font-semibold px-6 py-3 rounded-full mb-6 hover:from-blue-600 hover:to-teal-600 transition transform hover:-translate-y-1 shadow-lg"
        style={{
          boxShadow: "0 4px 14px rgba(0, 0, 0, 0.1)",
        }}
      >
        <motion.div
          initial={{ rotate: 0 }}
          whileHover={{ rotate: 360 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center"
        >
          Back
        </motion.div>
      </button>

      <div className="flex flex-col lg:flex-row items-center gap-12">
        {product.image ? (
          <motion.div
            className="w-full lg:w-1/2 h-96 relative"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            style={{
              borderRadius: "12px",
              overflow: "hidden",
            }}
          >
            <motion.img
              src={product.image}
              alt={product.description}
              className="w-full h-full object-cover"
              style={{ filter: "brightness(80%)" }}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.5 }}
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"
              style={{ mixBlendMode: "multiply" }}
            />
          </motion.div>
        ) : (
          <div className="w-full lg:w-1/2 h-96 bg-gray-200 flex items-center justify-center text-gray-500 rounded-lg shadow-xl">
            No Image Available
          </div>
        )}

        <div className="lg:w-1/2 space-y-6 bg-white p-6 rounded-lg shadow-lg border-t-4 border-b-4 border-gradient-to-r from-blue-500 to-teal-500">
          <motion.h1
            className="text-5xl font-extrabold text-gray-900 mb-8 flex items-center space-x-4"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            style={{
              background: "linear-gradient(to right, #ff7e5f, #feb47b)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            <span>{product.description}</span>
            {flagUrl ? (
              <motion.img
                src={flagUrl}
                alt={product.nationality}
                className="w-10 h-10 rounded-full shadow-md"
                title={product.nationality}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3 }}
              />
            ) : (
              <span className="text-sm text-gray-500">(No flag available)</span>
            )}
          </motion.h1>

          <Formik
            initialValues={{
              price: product.price,
              qty: product.qty,
              category: product.category,
              location: product.location,
              nationality: product.nationality,
              size: product.size,
              description: product.description
            }}
            validationSchema={validationSchema}
            onSubmit={handleEditClick}
          >
            {({ values }) => (
              <Form className="lg:w-1/2 space-y-6 bg-white p-6 rounded-lg shadow-lg border-t-4 border-b-4 border-gradient-to-r from-blue-500 to-teal-500">
                <div>
                  <label htmlFor="description" className="text-lg text-gray-600">
                    Description:
                  </label>
                  <Field
                    id="description"
                    name="description"
                    type="text"
                    className="text-base text-gray-700 w-full p-2 border border-gray-300 rounded-lg"
                  />
                  <ErrorMessage
                    name="category"
                    component="div"
                    className="text-red-600"
                  />
                </div>

                <div>
                  <label htmlFor="price" className="text-lg text-gray-600">
                    Price:
                  </label>
                  <Field
                    id="price"
                    name="price"
                    type="number"
                    className="text-base text-gray-700 w-full p-2 border border-gray-300 rounded-lg"
                  />
                  <ErrorMessage
                    name="price"
                    component="div"
                    className="text-red-600"
                  />
                </div>

                <div>
                  <label htmlFor="qty" className="text-lg text-gray-600">
                    Quantity:
                  </label>
                  <Field
                    id="qty"
                    name="qty"
                    type="number"
                    className="text-base text-gray-700 w-full p-2 border border-gray-300 rounded-lg"
                    min="1"
                  />
                  <ErrorMessage
                    name="qty"
                    component="div"
                    className="text-red-600"
                  />
                </div>

                <div>
                  <label htmlFor="category" className="text-lg text-gray-600">
                    Category:
                  </label>
                  <Field
                    id="category"
                    name="category"
                    type="text"
                    className="text-base text-gray-700 w-full p-2 border border-gray-300 rounded-lg"
                  />
                  <ErrorMessage
                    name="category"
                    component="div"
                    className="text-red-600"
                  />
                </div>

                <div>
                  <label htmlFor="location" className="text-lg text-gray-600">
                    Location:
                  </label>
                  <Field
                    id="location"
                    name="location"
                    type="text"
                    className="text-base text-gray-700 w-full p-2 border border-gray-300 rounded-lg"
                  />
                  <ErrorMessage
                    name="location"
                    component="div"
                    className="text-red-600"
                  />
                </div>

                <div>
                  <label htmlFor="nationality" className="text-lg text-gray-600">
                    Nationality:
                  </label>
                  <Field
                    id="nationality"
                    name="nationality"
                    type="text"
                    className="text-base text-gray-700 w-full p-2 border border-gray-300 rounded-lg"
                  />
                  <ErrorMessage
                    name="nationality"
                    component="div"
                    className="text-red-600"
                  />
                </div>

                <div>
                  <label htmlFor="size" className="text-lg text-gray-600">
                    Size:
                  </label>
                  <Field
                    id="size"
                    name="size"
                    type="text"
                    className="text-base text-gray-700 w-full p-2 border border-gray-300 rounded-lg"
                  />
                  <ErrorMessage
                    name="size"
                    component="div"
                    className="text-red-600"
                  />
                </div>

                <button type="submit">Save Edit</button>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </motion.div>
  );
};

export default FishEditDetail;
