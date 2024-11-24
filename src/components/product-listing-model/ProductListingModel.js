import React, { useEffect, useState } from "react";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import { Input } from "reactstrap";

import "./ProductListingModel.css";
import searchIcon from "../../assets/images/search-icon.svg";

function ProductListingModel({ modal, toggle, newProductAdd }) {
  const [product, setProduct] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState([]);

  const [search, setSearch] = useState("");

  const initailSelectProduct = (product, variants) => {
    let selectedProducts = { ...product }; // Start with a copy of the product

    // Check if selectedProduct already exists and has a length
    setSelectedProduct((prevSelected) => {
      const isSelectedProduct = prevSelected.find(
        (item) => item.id === product.id
      );

      if (isSelectedProduct) {
        selectedProducts = {
          ...selectedProducts,
          variants: [...(isSelectedProduct.variants || []), ...variants],
        };

        // Update the selected product in the state immutably
        return prevSelected.map((p) =>
          p.id === product.id ? selectedProducts : p
        );
      } else {
        selectedProducts = { ...product, variants: variants };
        return [...prevSelected, selectedProducts];
      }
    });
  };
  const removeProductOrVariant = (product, variant) => {
    setSelectedProduct((prevSelected) => {
      // Remove the variant from the product's variants
      return prevSelected.reduce((acc, currentProduct) => {
        if (currentProduct.id === product.id) {
          const updatedVariants = currentProduct.variants.filter(
            (v) => !variant.some((removeVariant) => v.id === removeVariant.id)
          );

          if (updatedVariants.length === 0) {
            // If no variants left, remove the product entirely
            return acc.filter((item) => item.id !== currentProduct.id);
          } else {
            // If variants still remain, update the product with remaining variants
            acc.push({ ...currentProduct, variants: updatedVariants });
          }
        } else {
          // If the product is not the one being updated, keep it as is
          acc.push(currentProduct);
        }
        return acc;
      }, []);
    });
  };

  const handleProduct = () => {
    newProductAdd(selectedProduct);
    setSelectedProduct([]);
    toggle();
  };

  useEffect(() => {
    const searchTime = setTimeout(() => {
      const searchProduct = product.filter((item) => {
        return item?.title?.toLowerCase()?.includes(search?.toLowerCase());
      });

      setProduct(searchProduct);
    }, 300);
    return () => clearTimeout(searchTime);
  }, [search]);

  const getProductData = () => {
    fetch(
      "http://stageapi.monkcommerce.app/task/products/search?search=Hat&page=2&limit=1",
      {
        method: "GET",
        headers: {
          "x-api-key": "72njgfa948d9aS7gs5",
        },
      }
    ).then((res) => {
      setProduct(res.data);
    });
  };

  useEffect(() => {
    if (modal) {
      getProductData();
    }
  }, [modal]);

  return (
    <div>
      <Modal className="product-model" isOpen={modal} toggle={toggle}>
        <ModalHeader toggle={toggle}>Select Products</ModalHeader>
        <ModalBody>
          <div className="search-field">
            <img src={searchIcon} alt="search icon" className="search-icon" />
            <input
              type="text"
              placeholder="Search product"
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <hr />
          <div className="product-detail-section">
            {product?.map((item) => (
              <ul className="parent-ul" key={item?.id}>
                <li>
                  <div className="parent-li">
                    <Input
                      type="checkbox"
                      onClick={(e) => {
                        if (e.target.checked) {
                          initailSelectProduct(item, item.variants);
                        } else {
                          removeProductOrVariant(item, item.variants);
                        }
                      }}
                      checked={selectedProduct?.some(
                        (product) => product.id === item.id
                      )}
                    />
                    <img src={item.image.src} alt="product" width={"36px"} />
                    <p>{item.title}</p>
                  </div>
                  <hr />

                  {item.variants.map((variant) => (
                    <ul key={variant.id}>
                      <li className="variant-list">
                        <div className="variant-checkbox">
                          <Input
                            type="checkbox"
                            onClick={(e) => {
                              if (e.target.checked) {
                                initailSelectProduct(item, [variant]); // Correctly pass variant as an array
                              } else {
                                removeProductOrVariant(item, [variant]);
                              }
                            }}
                            checked={selectedProduct?.some(
                              (product) =>
                                product.id === item.id &&
                                product.variants?.some(
                                  (existVariant) =>
                                    existVariant?.id === variant.id
                                )
                            )}
                          />

                          <p className="variant-title">{variant.title}</p>
                        </div>
                        <div className="variant-price">
                          <p className="variant-available">99 available</p>
                          <p>$ {variant.price}</p>
                        </div>
                      </li>
                      <hr />
                    </ul>
                  ))}
                </li>
              </ul>
            ))}
          </div>
        </ModalBody>
        <ModalFooter>
          <p className="product-size">
            {selectedProduct?.length} product selected
          </p>
          <Button className="cancel-btn" onClick={toggle} outline>
            Cancel
          </Button>{" "}
          <Button
            color="secondary"
            className="add-button"
            onClick={handleProduct}
          >
            Add
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

export default ProductListingModel;
