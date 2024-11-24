import React, { useReducer, useState } from "react";
import { DragDropContext, Draggable } from "react-beautiful-dnd";
import { StrictModeDroppable } from "./StrictModeDroppable";

import "./AddProduct.css";
import listIcon from "../../assets/images/list-icon.svg";
import editIcon from "../../assets/images/edit-icon.svg";
import upIcon from "../../assets/images/up-icon.svg";
import downIcon from "../../assets/images/down.svg";
import crossIcon from "../../assets/images/cross-icon.svg";

import ProductListingModel from "../product-listing-model/ProductListingModel";

const initialSelectedProduct = [];

const reducer = (state, action) => {
  switch (action.type) {
    case "ADDPRODUCTS":
      return [...state, ...action.product];
    case "REMOVEPRODUCT":
      return state.filter((item) => item.id !== action.product.id);
    case "REORDER_PRODUCTS":
      const items = Array.from(state);
      const [reorderedItem] = items.splice(action.source, 1);
      items.splice(action.destination, 0, reorderedItem);
      return items;
    case "ADDPRODUCTDISCOUNT":
      return state.map((item) => {
        if (item?.id === action.product.id) {
          return { ...item, discount: action?.discountPrice };
        }
        return item;
      });
    case "ADDPRODUCTTYPE":
      return state.map((item) => {
        if (item?.id === action.product.id) {
          return { ...item, discountType: action?.discountType };
        }
        return item;
      });
    case "REMOVEVARIANT":
      return state.map((item) => {
        if (item?.id === action.product.id) {
          return {
            ...item,
            variants: item.variants?.filter(
              (proVariant) => proVariant?.id !== action.variant?.id
            ),
          };
        }
        return item;
      });
      case "ADDVARIANTDISCOUNT":
        return state.map((item) => {
          if (item?.id === action.product.id) {
            return {
              ...item,
              variants: item.variants?.map((proVariant) => {
                if (proVariant?.id === action.variant) {
                  return {
                    ...proVariant,
                    discount: action?.discountPrice,
                  };
                }
                return proVariant;
              }),
            };
          }
          return item;
        });
    case "ADDVARIANTTYPE":
      return state.map((item) => {
        if (item?.id === action.product.id) {
          return {
            ...item,
            variants: item.variants?.map((proVariant) => {
              if (proVariant?.id === action.variant) {
                return {
                  ...proVariant,
                  discountType: action?.discountType,
                };
              }
              return proVariant;
            }),
          };
        }
        return item;
      });
    case "REORDER_VARIANTS":
      return state.map((item) => {
        if (item.id.toString() === action.productId) {
          const variants = Array.from(item.variants);
          const [movedVariant] = variants.splice(action.source, 1);
          variants.splice(action.destination, 0, movedVariant);

          return { ...item, variants };
        }
        return item;
      });

    default:
      return state;
  }
};

function AddProduct() {
  const [product, dispatch] = useReducer(reducer, initialSelectedProduct);
  const [modal, setModal] = useState(false);
  const [addDiscount, setAddDiscount] = useState({});
  const [isShowVariant, setIsShowVariant] = useState({});

  const toggle = () => setModal(!modal);

  const newProductAdd = (newProduct) => {
    const productsToAdd = Array.isArray(newProduct) ? newProduct : [newProduct];
    dispatch({ type: "ADDPRODUCTS", product: productsToAdd });
  };

  const handleDragEnd = (result) => {
    const { source, destination, type } = result;

    if (!destination) return;

    // If dropped in the same position
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    // Handle product reordering
    if (type === "PRODUCT") {
      dispatch({
        type: "REORDER_PRODUCTS",
        source: source.index,
        destination: destination.index,
      });
      return;
    }

    // Handle variant reordering
    if (type === "VARIANT") {
      const sourceProductId = source.droppableId;
      const destProductId = destination.droppableId;

      console.log(
        "sourceProductId === destProductId: ",
        sourceProductId === destProductId
      );
      if (sourceProductId === destProductId) {
        // Reordering within the same product
        dispatch({
          type: "REORDER_VARIANTS",
          productId: sourceProductId,
          source: source.index,
          destination: destination.index,
        });
      }
    }
  };

  // add dicounts
  const toggleDiscount = (productId) => {
    setAddDiscount((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

  // add variant
  const toggleVariant = (productId) => {
    setIsShowVariant((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

  return (
    <div className="add-product-container">
      <div>
        <h2>Add Products</h2>
        <div className="selected-product-section">
          <div className="select-product-field">
            <h3 className="product">Product</h3>
            <h3 className="discount">Discount</h3>
          </div>

          <DragDropContext onDragEnd={handleDragEnd}>
            <StrictModeDroppable droppableId="products" type="PRODUCT">
              {(provided, snapshot) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className={`droppable ${
                    snapshot.isDraggingOver ? "dragging-over" : ""
                  }`}
                >
                  {product.length === 0 ? (
                    <div className="add-discount-section">
                      <div className="select-product">
                        <img
                          src={listIcon}
                          alt="list icon"
                          className="list-icon"
                        />
                        <div className="select-field">
                          1.{" "}
                          <input
                            type="text"
                            placeholder="Select Product"
                            readOnly
                            onClick={toggle}
                          />
                          <img
                            src={editIcon}
                            className="edit-icon"
                            alt="edit icon"
                          />
                        </div>
                      </div>
                      <button
                        className="add-discount"
                        onClick={() => toggleDiscount("initial")}
                      >
                        Add Discount
                      </button>
                    </div>
                  ) : (
                    product.map((item, index) => (
                      <Draggable
                        key={item.id.toString()}
                        draggableId={item.id.toString()}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`product-item ${
                              snapshot.isDragging ? "dragging" : ""
                            }`}
                          >
                            {/* Product Header - Draggable Handle */}
                            <div
                              {...provided.dragHandleProps}
                              className="add-discount-section"
                            >
                              <div className="select-product">
                                <img
                                  src={listIcon}
                                  alt="list icon"
                                  className="list-icon"
                                />
                                <div className="select-field">
                                  {index + 1}.{" "}
                                  <input
                                    type="text"
                                    placeholder="Select Product"
                                    value={item.title}
                                    readOnly
                                  />
                                  <img
                                    src={editIcon}
                                    className="edit-icon"
                                    alt="edit icon"
                                  />
                                </div>
                              </div>

                              {/* Discount Section */}
                              {addDiscount[item.id] ? (
                                <div className="discount-field">
                                  <input
                                    type="text"
                                    onChange={(e) =>
                                      dispatch({
                                        type: "ADDPRODUCTDISCOUNT",
                                        product: item,
                                        discountPrice: e.target.value,
                                      })
                                    }
                                    placeholder="Enter discount"
                                  />
                                  <select
                                    onChange={(e) =>
                                      dispatch({
                                        type: "ADDPRODUCTTYPE",
                                        product: item,
                                        discountType: e.target.value,
                                      })
                                    }
                                    value={item.discountType || "off"}
                                  >
                                    <option value="off">% off</option>
                                    <option value="flat">flat</option>
                                  </select>
                                </div>
                              ) : (
                                <button
                                  className="add-discount"
                                  onClick={() => toggleDiscount(item.id)}
                                >
                                  Add Discount
                                </button>
                              )}

                              {/* Remove Product Button */}
                              <img
                                src={crossIcon}
                                alt="remove product"
                                className="cross-icon"
                                onClick={() => {
                                  dispatch({
                                    type: "REMOVEPRODUCT",
                                    product: item,
                                  });
                                }}
                              />
                            </div>

                            {/* Variants Toggle Section */}
                            <div className="variant-hide-section">
                              <p onClick={() => toggleVariant(item.id)}>
                                {isShowVariant[item.id] ? "Hide" : "Show"}{" "}
                                variants
                                <img
                                  src={
                                    isShowVariant[item.id] ? downIcon : upIcon
                                  }
                                  alt={
                                    isShowVariant[item.id]
                                      ? "hide variants"
                                      : "show variants"
                                  }
                                />
                              </p>
                            </div>

                            {/* Variants Droppable Area */}
                            {isShowVariant[item.id] && (
                              <StrictModeDroppable
                                droppableId={item.id.toString()}
                                type="VARIANT"
                              >
                                {(providedVariant, snapshotVariant) => (
                                  <div
                                    ref={providedVariant.innerRef}
                                    {...providedVariant.droppableProps}
                                    className={`variants-container ${
                                      snapshotVariant.isDraggingOver
                                        ? "dragging-over"
                                        : ""
                                    }`}
                                  >
                                    {item.variants?.map(
                                      (variant, variantIndex) => (
                                        <Draggable
                                          key={variant.id.toString()}
                                          draggableId={`variant-${variant.id}`}
                                          index={variantIndex}
                                        >
                                          {(
                                            providedVariantDrag,
                                            snapshotVariant
                                          ) => (
                                            <div
                                              ref={providedVariantDrag.innerRef}
                                              {...providedVariantDrag.draggableProps}
                                              {...providedVariantDrag.dragHandleProps}
                                              className={`variant-section ${
                                                snapshotVariant.isDragging
                                                  ? "dragging"
                                                  : ""
                                              }`}
                                            >
                                              {/* Variant Content */}
                                              <div className="variant-name-section">
                                                <img
                                                  src={listIcon}
                                                  alt="list icon"
                                                  className="list-icon"
                                                />
                                                <p>{variant.title}</p>
                                              </div>

                                              {/* Variant Discount */}
                                              <div className="discount-field variant-discount">
                                                <input
                                                  type="text"
                                                  placeholder="Enter variant discount"
                                                  value={variant.discount || ""}
                                                  onChange={(e) => {
                                                    dispatch({
                                                      type: "ADDVARIANTDISCOUNT",
                                                      product: item,
                                                      variant: variant.id,
                                                      discountPrice:
                                                        e.target.value,
                                                    });
                                                  }}
                                                />
                                                <select
                                                  value={
                                                    variant.discountType ||
                                                    "off"
                                                  }
                                                  onChange={(e) => {
                                                    dispatch({
                                                      type: "ADDVARIANTTYPE",
                                                      product: item,
                                                      variant: variant.id,
                                                      discountType:
                                                        e.target.value,
                                                    });
                                                  }}
                                                >
                                                  <option value="off">
                                                    % off
                                                  </option>
                                                  <option value="flat">
                                                    flat
                                                  </option>
                                                </select>
                                              </div>

                                              {/* Remove Variant Button */}
                                              <img
                                                src={crossIcon}
                                                alt="remove variant"
                                                className="cross-icon"
                                                onClick={() => {
                                                  dispatch({
                                                    type: "REMOVEVARIANT",
                                                    product: item,
                                                    variant,
                                                  });
                                                }}
                                              />
                                            </div>
                                          )}
                                        </Draggable>
                                      )
                                    )}
                                    {providedVariant.placeholder}
                                  </div>
                                )}
                              </StrictModeDroppable>
                            )}
                            <hr />
                          </div>
                        )}
                      </Draggable>
                    ))
                  )}
                  {provided.placeholder}
                </div>
              )}
            </StrictModeDroppable>
          </DragDropContext>
        </div>

        {/* Add Product Button */}
        <div className="add-product">
          <button className="add-product-button" onClick={toggle}>
            Add Product
          </button>
        </div>
      </div>

      {/* Product Listing Modal */}
      <ProductListingModel
        modal={modal}
        toggle={toggle}
        newProductAdd={newProductAdd}
      />
    </div>
  );
}

export default AddProduct;
