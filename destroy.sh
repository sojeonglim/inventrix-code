#!/bin/bash
set -e

echo "=== Inventrix AWS Resource Cleanup Script ==="
echo ""

# Check if setup_info.txt exists
if [ -f "setup_info.txt" ]; then
  echo "Loading deployment info from setup_info.txt..."
  source setup_info.txt
  echo ""
else
  echo "setup_info.txt not found. Please enter resource information manually."
  echo ""
  
  # List available AWS profiles
  echo "Available AWS Profiles:"
  PROFILES=($(aws configure list-profiles 2>/dev/null))
  if [[ ${#PROFILES[@]} -eq 0 ]]; then
    echo "No AWS profiles found. Using 'default'."
    AWS_PROFILE="default"
  else
    for i in "${!PROFILES[@]}"; do
      echo "$((i+1)). ${PROFILES[$i]}"
    done
    echo ""
    read -p "Select profile number or enter profile name [default]: " PROFILE_INPUT
    
    if [[ "$PROFILE_INPUT" =~ ^[0-9]+$ ]]; then
      idx=$((PROFILE_INPUT-1))
      if [[ $idx -ge 0 && $idx -lt ${#PROFILES[@]} ]]; then
        AWS_PROFILE="${PROFILES[$idx]}"
      else
        echo "Invalid selection. Using 'default'."
        AWS_PROFILE="default"
      fi
    else
      AWS_PROFILE="${PROFILE_INPUT:-default}"
    fi
  fi
  
  read -p "AWS Region [ap-southeast-2]: " AWS_REGION
  AWS_REGION="${AWS_REGION:-ap-southeast-2}"
  
  read -p "Instance ID (optional): " INSTANCE_ID
  read -p "Key Pair Name [inventrix-key]: " KEY_NAME
  KEY_NAME="${KEY_NAME:-inventrix-key}"
  
  read -p "Security Group Name [inventrix-sg]: " SECURITY_GROUP_NAME
  SECURITY_GROUP_NAME="${SECURITY_GROUP_NAME:-inventrix-sg}"
  
  SECURITY_GROUP_ID=""
  echo ""
fi

AWS_OPTS="--profile $AWS_PROFILE --region $AWS_REGION"

# Get security group ID if not set
if [ -z "$SECURITY_GROUP_ID" ] && [ -n "$SECURITY_GROUP_NAME" ]; then
  SECURITY_GROUP_ID=$(aws ec2 describe-security-groups $AWS_OPTS --group-names $SECURITY_GROUP_NAME --query 'SecurityGroups[0].GroupId' --output text 2>/dev/null || echo "")
fi

# Display resources to be deleted
echo "=== Resources to be deleted ==="
echo "AWS Profile:         $AWS_PROFILE"
echo "AWS Region:          $AWS_REGION"
echo "Instance ID:         ${INSTANCE_ID:-none}"
echo "Key Pair Name:       ${KEY_NAME:-none}"
echo "Security Group:      ${SECURITY_GROUP_NAME:-none} ${SECURITY_GROUP_ID:+($SECURITY_GROUP_ID)}"
echo ""

# Confirm
read -p "Are you sure you want to delete these resources? (yes/no): " CONFIRM
if [[ "$CONFIRM" != "yes" ]]; then
  echo "Cleanup cancelled."
  exit 0
fi

echo ""

# Terminate EC2 instance
if [ -n "$INSTANCE_ID" ]; then
  # Check instance state
  INSTANCE_STATE=$(aws ec2 describe-instances $AWS_OPTS --instance-ids $INSTANCE_ID --query 'Reservations[0].Instances[0].State.Name' --output text 2>/dev/null || echo "not-found")
  echo "Instance state: $INSTANCE_STATE"

  if [[ "$INSTANCE_STATE" == "terminated" || "$INSTANCE_STATE" == "not-found" ]]; then
    echo "Instance is already terminated or not found. Skipping."
  else
    # Check termination protection
    TERM_PROTECTION=$(aws ec2 describe-instance-attribute $AWS_OPTS --instance-id $INSTANCE_ID --attribute disableApiTermination --query 'DisableApiTermination.Value' --output text 2>/dev/null || echo "false")
    if [[ "$TERM_PROTECTION" == "true" ]]; then
      echo "WARNING: Termination protection is enabled."
      read -p "Disable termination protection and proceed? (yes/no): " DISABLE_PROT
      if [[ "$DISABLE_PROT" == "yes" ]]; then
        aws ec2 modify-instance-attribute $AWS_OPTS --instance-id $INSTANCE_ID --no-disable-api-termination
        echo "Termination protection disabled."
      else
        echo "Skipping instance termination."
        INSTANCE_ID=""
      fi
    fi

    if [ -n "$INSTANCE_ID" ]; then
      echo "Terminating EC2 instance: $INSTANCE_ID (was $INSTANCE_STATE)"
      aws ec2 terminate-instances $AWS_OPTS --instance-ids $INSTANCE_ID &>/dev/null || echo "Failed to terminate instance"
      echo "Waiting for instance termination..."
      aws ec2 wait instance-terminated $AWS_OPTS --instance-ids $INSTANCE_ID 2>/dev/null || true
      echo "Instance terminated."
    fi
  fi
fi

# Delete security group
if [ -n "$SECURITY_GROUP_ID" ]; then
  echo "Deleting security group: $SECURITY_GROUP_NAME ($SECURITY_GROUP_ID)"
  aws ec2 delete-security-group $AWS_OPTS --group-id $SECURITY_GROUP_ID &>/dev/null || echo "Security group not found or already deleted"
  echo "Security group deleted."
fi

# Delete key pair
if [ -n "$KEY_NAME" ]; then
  echo "Deleting key pair: $KEY_NAME"
  aws ec2 delete-key-pair $AWS_OPTS --key-name $KEY_NAME &>/dev/null || echo "Key pair not found or already deleted"
  
  # Delete local key file
  if [ -f "${KEY_NAME}.pem" ]; then
    rm -f ${KEY_NAME}.pem
    echo "Local key file ${KEY_NAME}.pem deleted."
  fi
  echo "Key pair deleted."
fi

# Delete setup_info.txt
if [ -f "setup_info.txt" ]; then
  rm -f setup_info.txt
  echo "setup_info.txt deleted."
fi

echo ""
echo "=== Cleanup Complete ==="
echo "All resources have been deleted."
