var Counter = function(onChanged) {
    var self = this;
    self.count = 0;
    
    self.increment = function() {
        self.count++;
        if (onChanged) {
            onChanged(self.count);
        }
    }
}