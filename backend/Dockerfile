# Use Odoo 18 official base image
FROM odoo:18.0

USER root

# Install Python packages required for JWT and API routes
COPY requirements.txt /tmp/requirements.txt
RUN pip3 install --no-cache-dir -r /tmp/requirements.txt

# Copy our custom Odoo module
COPY ./ecosphere_ai /mnt/extra-addons/ecosphere_ai

# Set permissions
RUN chown -R odoo:odoo /mnt/extra-addons/ecosphere_ai

USER odoo
