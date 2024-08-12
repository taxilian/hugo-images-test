"use strict";
/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(globalThis["webpackChunk"] = globalThis["webpackChunk"] || []).push([["src_cart_cartStore_ts-_c0bc1"],{

/***/ "./src/cart/cartStore.ts":
/*!*******************************!*\
  !*** ./src/cart/cartStore.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   useCartStore: () => (/* binding */ useCartStore)\n/* harmony export */ });\n/* harmony import */ var pinia__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! pinia */ \"../node_modules/pinia/dist/pinia.mjs\");\n/* harmony import */ var vue__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! vue */ \"../node_modules/vue/dist/vue.runtime.esm-bundler.js\");\n/* harmony import */ var _graphql_shopClient__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../graphql/shopClient */ \"./src/graphql/shopClient.ts\");\n\n\n\nconsole.log(\"Loading cart store\");\nconst useCartStore = (0,pinia__WEBPACK_IMPORTED_MODULE_2__.defineStore)('cart', () => {\n  const cartVisible = (0,vue__WEBPACK_IMPORTED_MODULE_0__.ref)(false);\n  const isLoading = (0,vue__WEBPACK_IMPORTED_MODULE_0__.ref)(0);\n  const orderData = (0,vue__WEBPACK_IMPORTED_MODULE_0__.ref)({});\n  const insufficientAvail = (0,vue__WEBPACK_IMPORTED_MODULE_0__.ref)({});\n  function formatPrice(price) {\n    const adjPrice = price / 100;\n    if (isNaN(adjPrice)) return 0 .toFixed(2);else return (price / 100).toFixed(2);\n  }\n  const subtotal = (0,vue__WEBPACK_IMPORTED_MODULE_0__.computed)(() => {\n    return formatPrice(orderData.value.subTotal);\n  });\n  const items = (0,vue__WEBPACK_IMPORTED_MODULE_0__.computed)(() => {\n    return orderData.value.lines || [];\n  });\n  const itemCount = (0,vue__WEBPACK_IMPORTED_MODULE_0__.computed)(() => {\n    return items.value.reduce((acc, cur) => acc + cur.quantity, 0);\n  });\n  function updateOrder(updates) {\n    for (const [key, value] of Object.entries(updates)) {\n      orderData.value[key] = structuredClone(value);\n    }\n  }\n  async function ensureOrderExists() {\n    if (!orderData.value) {\n      await refresh();\n    }\n    if (!orderData.value) {\n      throw new Error(\"Could not add to order, order not loading\");\n    }\n  }\n  async function refresh() {\n    try {\n      isLoading.value++;\n      const order = await (0,_graphql_shopClient__WEBPACK_IMPORTED_MODULE_1__.getActiveOrder)();\n      orderData.value = structuredClone(order.data.activeOrder || {});\n    } catch (err) {\n      console.error(\"Could not refresh shopping cart! \", err);\n    } finally {\n      isLoading.value--;\n    }\n  }\n  async function removeFromCart(variantId) {\n    try {\n      isLoading.value++;\n      await ensureOrderExists();\n      const result = await (0,_graphql_shopClient__WEBPACK_IMPORTED_MODULE_1__.removeOrderLine)({\n        id: variantId\n      });\n      if (result.errors || !result.data) {\n        console.error(\"Could not remove item from order: \", result);\n      } else {\n        const info = result.data.removeOrderLine;\n        if (!info.__typename) {\n          throw new Error(\"Could not remove item from order, unknown error\" + JSON.stringify(result.data));\n        } else if (info.__typename !== \"Order\") {\n          throw new Error(\"Could not remove item from order: \" + JSON.stringify(info));\n        } else {\n          updateOrder(info);\n        }\n      }\n    } catch (err) {\n      console.error(\"Could not remove item from order: \", err);\n    } finally {\n      isLoading.value--;\n    }\n  }\n  function processOrderChange(variantId, result) {\n    if (result.errors || !result.data) {\n      console.error(\"Could not add item to order: \", result);\n    } else {\n      const info = 'addItemToOrder' in result.data ? result.data.addItemToOrder : result.data.adjustOrderLine;\n      if (!info.__typename) {\n        throw new Error(\"Could not add item to order, unknown error\" + JSON.stringify(result.data));\n      }\n      switch (info.__typename) {\n        case 'InsufficientStockError':\n          insufficientAvail.value[variantId] = info.quantityAvailable;\n          updateOrder(info.order);\n          break;\n        case 'Order':\n          updateOrder(info);\n          break;\n        case 'NegativeQuantityError':\n        case 'OrderLimitError':\n        case 'OrderModificationError':\n          throw new Error(\"Could not add item to order: \" + info.message);\n      }\n    }\n  }\n  async function addToCart(variantId, quantity) {\n    try {\n      isLoading.value++;\n      await ensureOrderExists();\n      const result = await (0,_graphql_shopClient__WEBPACK_IMPORTED_MODULE_1__.addItemToOrder)({\n        productVariantId: variantId,\n        quantity\n      });\n      processOrderChange(variantId, result);\n      return orderData.value;\n    } catch (err) {\n      console.error(\"Could not add item to order: \", err);\n    } finally {\n      isLoading.value--;\n    }\n  }\n  async function updateItemQuantities(quantities) {\n    try {\n      isLoading.value++;\n      // Doing all of this asynchronously would be slightly better, but it's not worth the complexity\n      // and potential for out-of-order results to mess with things\n      for (const {\n        id,\n        quantity: qty\n      } of quantities) {\n        if (qty === 0) {\n          await removeFromCart(id); // This automatically updates things, no need to do anything special\n        } else {\n          const result = await (0,_graphql_shopClient__WEBPACK_IMPORTED_MODULE_1__.adjustOrderLine)({\n            id,\n            qty: qty\n          });\n          processOrderChange(id, result);\n        }\n      }\n    } catch (err) {\n      console.error(\"Could not update item quantities: \", err);\n    } finally {\n      isLoading.value--;\n    }\n  }\n  refresh();\n  return {\n    showCart() {\n      cartVisible.value = true;\n    },\n    hideCart() {\n      cartVisible.value = false;\n    },\n    toggleCart() {\n      cartVisible.value = !cartVisible.value;\n    },\n    cartVisible,\n    isLoading,\n    formatPrice,\n    subtotal,\n    items,\n    itemCount,\n    refresh,\n    addToCart,\n    removeFromCart,\n    updateItemQuantities\n  };\n});\n\n//# sourceURL=webpack:///./src/cart/cartStore.ts?");

/***/ }),

/***/ "./src/graphql/shopClient.ts":
/*!***********************************!*\
  !*** ./src/graphql/shopClient.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   addItemToOrder: () => (/* binding */ addItemToOrder),\n/* harmony export */   adjustOrderLine: () => (/* binding */ adjustOrderLine),\n/* harmony export */   getActiveOrder: () => (/* binding */ getActiveOrder),\n/* harmony export */   removeOrderLine: () => (/* binding */ removeOrderLine)\n/* harmony export */ });\n/* unused harmony exports gqlClient, applyCouponCode, removeCouponCode, setOrderBillingAddress, setOrderCustomField, setOrderShippingAddress, transitionOrderToState, getProductSummary */\n/* harmony import */ var _apollo_client_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @apollo/client/core */ \"../node_modules/@apollo/client/link/http/createHttpLink.js\");\n/* harmony import */ var _apollo_client_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @apollo/client/core */ \"../node_modules/@apollo/client/core/ApolloClient.js\");\n/* harmony import */ var _apollo_client_core__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @apollo/client/core */ \"../node_modules/@apollo/client/cache/inmemory/inMemoryCache.js\");\n/* harmony import */ var _mutation_addItemToOrder_graphql__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./mutation/addItemToOrder.graphql */ \"./src/graphql/mutation/addItemToOrder.graphql\");\n/* harmony import */ var _mutation_addItemToOrder_graphql__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_mutation_addItemToOrder_graphql__WEBPACK_IMPORTED_MODULE_3__);\n/* harmony import */ var _mutation_adjustOrderLine_graphql__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./mutation/adjustOrderLine.graphql */ \"./src/graphql/mutation/adjustOrderLine.graphql\");\n/* harmony import */ var _mutation_adjustOrderLine_graphql__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_mutation_adjustOrderLine_graphql__WEBPACK_IMPORTED_MODULE_4__);\n/* harmony import */ var _mutation_applyCouponCode_graphql__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./mutation/applyCouponCode.graphql */ \"./src/graphql/mutation/applyCouponCode.graphql\");\n/* harmony import */ var _mutation_applyCouponCode_graphql__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_mutation_applyCouponCode_graphql__WEBPACK_IMPORTED_MODULE_5__);\n/* harmony import */ var _mutation_removeCouponCode_graphql__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./mutation/removeCouponCode.graphql */ \"./src/graphql/mutation/removeCouponCode.graphql\");\n/* harmony import */ var _mutation_removeCouponCode_graphql__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(_mutation_removeCouponCode_graphql__WEBPACK_IMPORTED_MODULE_6__);\n/* harmony import */ var _mutation_removeOrderLine_graphql__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./mutation/removeOrderLine.graphql */ \"./src/graphql/mutation/removeOrderLine.graphql\");\n/* harmony import */ var _mutation_removeOrderLine_graphql__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(_mutation_removeOrderLine_graphql__WEBPACK_IMPORTED_MODULE_7__);\n/* harmony import */ var _mutation_setOrderBillingAddress_graphql__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./mutation/setOrderBillingAddress.graphql */ \"./src/graphql/mutation/setOrderBillingAddress.graphql\");\n/* harmony import */ var _mutation_setOrderBillingAddress_graphql__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(_mutation_setOrderBillingAddress_graphql__WEBPACK_IMPORTED_MODULE_8__);\n/* harmony import */ var _mutation_setOrderCustomField_graphql__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./mutation/setOrderCustomField.graphql */ \"./src/graphql/mutation/setOrderCustomField.graphql\");\n/* harmony import */ var _mutation_setOrderCustomField_graphql__WEBPACK_IMPORTED_MODULE_9___default = /*#__PURE__*/__webpack_require__.n(_mutation_setOrderCustomField_graphql__WEBPACK_IMPORTED_MODULE_9__);\n/* harmony import */ var _mutation_setOrderShippingAddress_graphql__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./mutation/setOrderShippingAddress.graphql */ \"./src/graphql/mutation/setOrderShippingAddress.graphql\");\n/* harmony import */ var _mutation_setOrderShippingAddress_graphql__WEBPACK_IMPORTED_MODULE_10___default = /*#__PURE__*/__webpack_require__.n(_mutation_setOrderShippingAddress_graphql__WEBPACK_IMPORTED_MODULE_10__);\n/* harmony import */ var _mutation_transitionOrderToState_graphql__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./mutation/transitionOrderToState.graphql */ \"./src/graphql/mutation/transitionOrderToState.graphql\");\n/* harmony import */ var _mutation_transitionOrderToState_graphql__WEBPACK_IMPORTED_MODULE_11___default = /*#__PURE__*/__webpack_require__.n(_mutation_transitionOrderToState_graphql__WEBPACK_IMPORTED_MODULE_11__);\n/* harmony import */ var _query_getActiveOrder_graphql__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./query/getActiveOrder.graphql */ \"./src/graphql/query/getActiveOrder.graphql\");\n/* harmony import */ var _query_getActiveOrder_graphql__WEBPACK_IMPORTED_MODULE_12___default = /*#__PURE__*/__webpack_require__.n(_query_getActiveOrder_graphql__WEBPACK_IMPORTED_MODULE_12__);\n/* harmony import */ var _query_productSummary_graphql__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./query/productSummary.graphql */ \"./src/graphql/query/productSummary.graphql\");\n/* harmony import */ var _query_productSummary_graphql__WEBPACK_IMPORTED_MODULE_13___default = /*#__PURE__*/__webpack_require__.n(_query_productSummary_graphql__WEBPACK_IMPORTED_MODULE_13__);\n\nconst httpLink = (0,_apollo_client_core__WEBPACK_IMPORTED_MODULE_0__.createHttpLink)({\n  credentials: 'include',\n  uri: window.backend_url\n});\nconst gqlClient = new _apollo_client_core__WEBPACK_IMPORTED_MODULE_1__.ApolloClient({\n  cache: new _apollo_client_core__WEBPACK_IMPORTED_MODULE_2__.InMemoryCache(),\n  connectToDevTools: true,\n  credentials: 'include',\n  link: httpLink\n});\n\n\n\n// import CreateStripePaymentIntent from './mutation/createStripePaymentIntent.graphql';\n\n\n\n\n\n\n\n\n/** Mutations */\nasync function addItemToOrder(variables) {\n  return await gqlClient.mutate({\n    mutation: (_mutation_addItemToOrder_graphql__WEBPACK_IMPORTED_MODULE_3___default()),\n    variables\n  });\n}\nasync function adjustOrderLine(variables) {\n  return await gqlClient.mutate({\n    mutation: (_mutation_adjustOrderLine_graphql__WEBPACK_IMPORTED_MODULE_4___default()),\n    variables\n  });\n}\nasync function applyCouponCode(variables) {\n  return await gqlClient.mutate({\n    mutation: (_mutation_applyCouponCode_graphql__WEBPACK_IMPORTED_MODULE_5___default()),\n    variables\n  });\n}\nasync function removeCouponCode(variables) {\n  return await gqlClient.mutate({\n    mutation: (_mutation_removeCouponCode_graphql__WEBPACK_IMPORTED_MODULE_6___default()),\n    variables\n  });\n}\nasync function removeOrderLine(variables) {\n  return await gqlClient.mutate({\n    mutation: (_mutation_removeOrderLine_graphql__WEBPACK_IMPORTED_MODULE_7___default()),\n    variables\n  });\n}\nasync function setOrderBillingAddress(variables) {\n  return await gqlClient.mutate({\n    mutation: (_mutation_setOrderBillingAddress_graphql__WEBPACK_IMPORTED_MODULE_8___default()),\n    variables\n  });\n}\nasync function setOrderCustomField(variables) {\n  return await gqlClient.mutate({\n    mutation: (_mutation_setOrderCustomField_graphql__WEBPACK_IMPORTED_MODULE_9___default()),\n    variables\n  });\n}\nasync function setOrderShippingAddress(variables) {\n  return await gqlClient.mutate({\n    mutation: (_mutation_setOrderShippingAddress_graphql__WEBPACK_IMPORTED_MODULE_10___default()),\n    variables\n  });\n}\nasync function transitionOrderToState(variables) {\n  return await gqlClient.mutate({\n    mutation: (_mutation_transitionOrderToState_graphql__WEBPACK_IMPORTED_MODULE_11___default()),\n    variables\n  });\n}\n/** Queries */\nasync function getActiveOrder() {\n  return await gqlClient.query({\n    query: (_query_getActiveOrder_graphql__WEBPACK_IMPORTED_MODULE_12___default())\n  });\n}\nasync function getProductSummary(variables) {\n  return await gqlClient.query({\n    query: (_query_productSummary_graphql__WEBPACK_IMPORTED_MODULE_13___default()),\n    variables\n  });\n}\n\n//# sourceURL=webpack:///./src/graphql/shopClient.ts?");

/***/ })

}]);