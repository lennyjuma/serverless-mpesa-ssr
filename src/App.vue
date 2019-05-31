<template class="layout-default" >
    <div id="app" class="has-navbar-fixed-top">
        <nav class="navbar is-fixed-top" role="navigation" aria-label="main navigation">
            <div class="navbar-brand">
                <a class="navbar-item" href="https://bulma.io">
                    <img alt="LOGO" src="https://bulma.io/images/bulma-logo.png" width="112" height="28">
                </a>

                <span :class="is_active" v-on:click="switchCollapse" role="button" class="navbar-burger burger" aria-label="menu" aria-expanded="false" data-target="navbarBasicExample">
                    <span aria-hidden="true"></span>
                    <span aria-hidden="true"></span>
                    <span aria-hidden="true"></span>
                </span>
            </div>

            <div id="navbarBasicExample" class="navbar-menu" :class="is_active" >
                <div class="navbar-start">
                    <a class="navbar-item">
                        Home
                    </a>

                    <a class="navbar-item">
                        Documentation
                    </a>

                    <div class="navbar-item has-dropdown is-hoverable">
                        <a class="navbar-link">
                            More
                        </a>

                        <div class="navbar-dropdown">
                            <a class="navbar-item">
                                About
                            </a>
                            <a class="navbar-item">
                                Jobs
                            </a>
                            <a class="navbar-item">
                                Contact
                            </a>
                            <hr class="navbar-divider">
                            <a class="navbar-item">
                                Report an issue
                            </a>
                        </div>
                    </div>
                </div>

                <div class="navbar-end">
                    <div class="navbar-item">
                        <div class="buttons">
                            <a class="button is-primary">
                                <strong>Sign up</strong>
                            </a>
                            <a class="button is-light">
                                Log in
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    </div>
</template>

<script>
  export default {
      name: "App",
      data: function () {
          return {
              isCollapse: true
          }
      },
      computed: {
          is_active() {
              if (this.isCollapse){
                  return ''
              } else {
                  return 'is-active'
              }
          }
      },
      methods: {
          switchCollapse() {
              console.log('switching collapse');
              this.isCollapse = !this.isCollapse ;
          }
      }
  }
</script>
