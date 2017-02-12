angular.module('infinite-cash-book', ['ionic', 'ngCordova'])

.config(function($ionicConfigProvider) {
  if (ionic.Platform.isAndroid()) {
    $ionicConfigProvider.scrolling.jsScrolling(true);

    ionic.Platform.ready(function(){
      //ionic.Platform.isFullScreen = true;
    });
  }
})

.factory('Transactions', function() {
  var transactionsCache = [];

  return {
    all: function() {
      if (transactionsCache.isEmpty()) {
        transactionsCache = angular.fromJson(window.localStorage['transactions'] || '[]');
      }

      return transactionsCache;
    },

    sum: function() {
      revenues = transactionsCache.filter(function(transaction) { return transaction.type == 'revenue'; });
      expenses = transactionsCache.filter(function(transaction) { return transaction.type == 'expense'; });
      return revenues.sum('value') - expenses.sum('value');
    },

    save: function(transactions) {
      transactionsCache = transactions;
      window.localStorage['transactions'] = angular.toJson(transactions);
    }
  }
})

.controller('TransactionsCtrl', function($scope, $ionicModal, Transactions) {
  $scope.transactions = Transactions.all();
  $scope.total_amount = Transactions.sum();

  $ionicModal.fromTemplateUrl('new-transaction.html', function(modal) {
    $scope.transactionModal = modal;
  }, {
    scope: $scope,
    animation: 'slide-in-up'
  });

  $scope.createTransaction = function(transaction) {
    $scope.errors = [];

    if (!transaction || !transaction.value) {
      $scope.errors.push('Preencha todos os campos');
      return;
    }

    if (transaction.value) {
      var value = parseFloat(transaction.value);

      if (value == NaN || value <= 0.0) {
        $scope.errors.push('Corrija o valor digitado');
        return;
      }
    }

    $scope.transactions.insert({
      id: $scope.transactions.length,
      description: transaction.description,
      value: transaction.value,
      type: transaction.type ? 'revenue' : 'expense',
      date: Date.create().format('{dd}/{MM}/{yyyy} {HH}:{mm}')
    }, 0);

    Transactions.save($scope.transactions);
    $scope.total_amount = Transactions.sum();

    $scope.errors = [];
    $scope.transactionModal.hide();

    transaction.description = '';
    transaction.value = '';
    transaction.type = '';
  };

  $scope.newTransaction = function() {
    $scope.transactionModal.show();
  };

  $scope.closeNewTransaction = function() {
    $scope.transactionModal.hide();
  };

  $scope.clearTransactions = function() {
    $scope.transactions = [];
    Transactions.save($scope.transactions);
    $scope.total_amount = Transactions.sum();
  };
});
