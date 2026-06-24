
resource "azurerm_resource_group" "incident_rg" {
  name     = "incident-rg-${var.ENVIRONMENT}"
  location = var.LOCATION
}

resource "azurerm_application_insights" "incident_ai" {
  name                = "incident-api-telemetry-${var.ENVIRONMENT}"
  location            = var.LOCATION
  resource_group_name = azurerm_resource_group.incident_rg.name
  application_type    = "web"
  
  lifecycle {
    ignore_changes = [workspace_id]
  }
}


// az login
// az account show
// terraform init
// terraform plan


