var Counter = function() {
    var self = this;
    
    self.value = 0;
    self.onValueChanged;
    
    self.increment = function() {
        self.value++;
        if (self.onValueChanged) {
            self.onValueChanged(self.value);
        }
    }    
}