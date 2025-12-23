import multiprocessing

# Worker Options
# Limit to 1 worker to prevent Out-Of-Memory (OOM) errors on Render Free Tier (512MB RAM)
workers = 1  

# Use 'gthread' to allow concurrent request handling without the memory overhead of multiple processes
worker_class = 'gthread' 
threads = 4  

# Timeout
# Increase to 120 seconds to prevent "WORKER TIMEOUT" during slow startups or heavy database operations
timeout = 120 

# Logging
loglevel = 'info'
accesslog = '-'
errorlog = '-'

# Bind
bind = "0.0.0.0:10000"
