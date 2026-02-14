import os
import pandas as pd
from sqlalchemy import create_engine
from dotenv import load_dotenv

load_dotenv()

class DataLoader:
    def __init__(self):
        # Fallback values from the provided application.properties if env vars are missing
        db_url = os.getenv('DB_URL', 'jdbc:postgresql://ep-lucky-tooth-ag8q522u-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require')
        
        # SQLAlchemy requires postgresql:// instead of jdbc:postgresql://
        # and doesn't support some JDBC/Spring-specific parameters like channelBinding
        self.sql_url = db_url.replace('jdbc:postgresql://', 'postgresql://')
        if 'channelBinding=' in self.sql_url:
            import re
            self.sql_url = re.sub(r'[&?]channelBinding=[^&]+', '', self.sql_url)
        
        self.user = os.getenv('DB_USERNAME', 'neondb_owner')
        self.password = os.getenv('DB_PASSWORD', 'npg_p1TULS4juAeJ')
        
        # Construct connection string
        # format: postgresql://user:password@host/dbname
        if '@' not in self.sql_url:
            host_part = self.sql_url.split('//')[1]
            self.conn_str = f"postgresql://{self.user}:{self.password}@{host_part}"
        else:
            self.conn_str = self.sql_url

        self.engine = create_engine(self.conn_str)

    def get_users(self):
        query = "SELECT id, skills, industry, created_at FROM users"
        return pd.read_sql(query, self.engine)

    def get_jobs(self):
        # Combining title and description for TF-IDF
        query = "SELECT id, title, description, skills_required, created_at FROM job_posts"
        return pd.read_sql(query, self.engine)

    def get_interactions(self):
        # interactionType: CLICK, VIEW, SAVE
        # We also need APPLICATION events
        query = """
        SELECT user_id, job_post_id, interaction_type as type, timestamp 
        FROM user_interaction
        UNION ALL
        SELECT user_id, job_post_id, 'APPLICATION' as type, created_at as timestamp 
        FROM applications
        """
        return pd.read_sql(query, self.engine)

    def get_connections(self):
        query = "SELECT requester_id, target_id, accepted, created_at FROM connections"
        return pd.read_sql(query, self.engine)

    def save_recommendations(self, df, table_name):
        df.to_sql(table_name, self.engine, if_exists='append', index=False)
