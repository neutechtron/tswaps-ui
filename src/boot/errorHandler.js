// import something here

const errorNotification = function(error) {
  let errorStr;
  console.log(error);
  try {
    if (error !== undefined) {
      if (typeof(error) != "object") {
        if (error.startsWith("assertion failure with message:")) {
          errorStr = error.split("assertion failure with message:")[1];
        } else {
          errorStr = error;
        }
      } else {
        errorStr = error;
      }
      
    } else {
      errorStr = "Cancelled transaction";
    }

    this.$q.notify({
      type: "negative",
      icon: "warning",
      message: `${errorStr}`
    });
  } catch (error) {
    this.$q.notify({
      type: "negative",
      icon: "warning",
      message: `${error}`
    });
  }
};

export default ({ Vue, store }) => {
  Vue.prototype.$errorNotification = errorNotification;
  store["$errorNotification"] = errorNotification;
};
