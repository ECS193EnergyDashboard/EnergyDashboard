

angular.module('menuBarModule').component('menuBar',{
  templateUrl: 'menu_bar/menu.template.html',
  controller: function MenuBarController() {
    this.menu = [{
      name: "Home",
      component: "home"
    }, {
      name: "About",
      component: "about"
    }, {
      name: "Contact",
      component: "contact"
    }];
  }
});

