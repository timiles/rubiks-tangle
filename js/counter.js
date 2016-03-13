var Counter = function(onChanged) {
    var self = this;
    self.value = 0;
    
    self.increment = function() {
        self.value++;
        if (onChanged) {
            onChanged(self.value);
        }
    }
}