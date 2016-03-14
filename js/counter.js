var Counter = function() {
    var self = this;
    
    self.value = 0;
    self.onValueChanged;
    
    self.increment = function(amount) {
        self.value += amount;
        if (self.onValueChanged) {
            self.onValueChanged();
        }
    }
    
    self.getValueFormatted = function() {
        return Number(self.value).toLocaleString();
    }
}