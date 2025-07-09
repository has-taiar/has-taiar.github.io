# Use the official Jekyll image with Ruby and Bundler pre-installed
FROM jekyll/jekyll:4.2.2

# Set the working directory
WORKDIR /srv/jekyll

# Copy the Gemfile and Gemfile.lock if they exist
COPY Gemfile* ./

# Install dependencies (if Gemfile exists)
RUN if [ -f Gemfile ]; then bundle install; fi

# Copy the rest of the site
COPY . .

# Expose the default Jekyll port
EXPOSE 4000

# Serve the site, watching for changes
CMD ["jekyll", "serve", "--host", "0.0.0.0", "--livereload"]
