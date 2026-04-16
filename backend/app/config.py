from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    DATABASE_URL: str = "postgresql://postgres:root@localhost:5432/ecoms"
    CORS_ORIGIN: str = ""
    CORS_ORIGIN_REGEX: str = ""
    CORS_ALLOW_VERCEL_REGEX: bool = True

    STRIPE_SECRET_KEY: str = ""
    STRIPE_PUBLISHABLE_KEY: str = "pk_test_51TMwlFRw5YKbpqMhXwKKSl2xEjwLarA3u7RYCD54bJndUmByWD2MlzyRAgBcifvQ7SgM9RxDIU0uPyOc3JTL7frR00xysTy1Bz"
    STRIPE_CURRENCY: str = "cad"


settings = Settings()
