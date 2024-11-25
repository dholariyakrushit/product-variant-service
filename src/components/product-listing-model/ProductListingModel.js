import React, { useEffect, useState } from 'react';
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Spinner,
} from 'reactstrap';
import { Input } from 'reactstrap';

import './ProductListingModel.css';
import searchIcon from '../../assets/images/search-icon.svg';

function ProductListingModel({ modal, toggle, newProductAdd }) {
  const [product, setProduct] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');

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
    setProduct([]);
    setSearch('');
    toggle();
  };

  const getProductData = (search) => {
    setIsLoading(true);
    fetch(
      `https://stageapi.monkcommerce.app/task/products/search?search=${search}&page=1&limit=20`,
      {
        method: 'GET',
        headers: {
          'x-api-key': '72njgfa948d9aS7gs5',
        },
      }
    )
      .then((res) => {
        return res.json();
      })
      .then((res) => {
        setIsLoading(false);
        setProduct(res);
      });
  };

  useEffect(() => {
    const searchTime =
      modal &&
      setTimeout(() => {
        getProductData(search || '');
      }, 400);
    return () => clearTimeout(searchTime);
  }, [modal, search]);

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
          {isLoading ? (
            <div className="product-detail-spinner">
              <Spinner>Loading...</Spinner>
            </div>
          ) : (
            <div className="product-detail-section">
              {product?.length > 0 &&
                product?.map((item) => (
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
                        <img
                          src={item.image.src}
                          alt="product"
                          width={'36px'}
                          className="product-image"
                        />
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
          )}
        </ModalBody>
        <ModalFooter>
          <p className="product-size">
            {selectedProduct?.length} product selected
          </p>
          <Button onClick={toggle} className="cancel-btn">
            Cancel
          </Button>{' '}
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
