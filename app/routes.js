module.exports = {
  routes: [
    {
      path: '/share-wizard', //'/share-wizard',
      component: require('./views/share-wizard'),
      children: [
        {
          path: '',
          component: require('./views/share-wizard/wizard0')
        },
        {
          path: 'wizard1',
          component: require('./views/share-wizard/wizard1')
        },
        {
          path: 'wizard2',
          component: require('./views/share-wizard/wizard2')
        },
        {
          path: 'wizard3',
          component: require('./views/share-wizard/wizard3')
        },
        {
          path: 'wizard4',
          component: require('./views/share-wizard/wizard4')
        },
        {
          path: 'wizard5',
          component: require('./views/share-wizard/wizard5')
        }
      ]
    },
    {
      path: '/overview',
      component: require('./views/overview')
    }
  ]
};
/*
{
  path: '/about',
  component: require('./views/about'),
  name: 'about'
},
{
  path: '/updater',
  component: require('./views/updater'),
  name: 'updater'
},
*/

/*,
{
  path: '/terms',
  component: require('./views/terms'),
  name: 'terms'
}
*/
