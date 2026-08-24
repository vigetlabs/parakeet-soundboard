class UserSerializer
  include JSONAPI::Serializer
  attributes :id, :email, :username, :needs_username
end
