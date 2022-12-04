import settings
import datalayer
try:
    import MySQLdb as mysql
    import MySQLdb.cursors as mysql_cursors
except ImportError:
    import pymysql as mysql
    import pymysql.cursors as mysql_cursors

migrations_sql = [
    'alter table `requests` add column `attributes` TEXT',
    'alter table `errors` add column `attributes` TEXT',
    'alter table `errors` drop column `attributes`',
    'alter table `requests` add column `status` INTEGER NOT NULL DEFAULT 0'
]


def check_migration(cur):
    cur.execute(
        "SELECT count(*) as migrations_exist FROM information_schema.TABLES WHERE (TABLE_SCHEMA = '{}') AND (TABLE_NAME = 'db_migrations')".format(
            settings.DB_NAME
        )
    )
    result = cur.fetchone()['migrations_exist']
    return result == 1


def add_migrations(cur):
    cur.execute('CREATE TABLE db_migrations (revision INTEGER NOT NULL PRIMARY KEY)')
    cur.execute('INSERT INTO db_migrations VALUES (0)')
    return 0


def get_migration_revision(cur):
    cur.execute('SELECT revision FROM db_migrations')
    return cur.fetchone()['revision']


def set_revision(cur, revision):
    cur.execute('UPDATE db_migrations SET revision = %s', (revision, ))

def main():
    conn = mysql.connect(
        host=settings.DB_HOST,
        user=settings.DB_USER,
        password=settings.DB_PASS,
        db=settings.DB_NAME,
        cursorclass=mysql_cursors.DictCursor
    )
    try:
        # init database
        with conn.cursor() as cursor:
            datalayer.Schedules.init(cursor)
            datalayer.Players.init(cursor)
            datalayer.Authorization.init(cursor)
            datalayer.PlayerGroups.init(cursor)
            datalayer.Files.init(cursor)
            datalayer.Protocol.init(cursor)
            datalayer.AccessGroups.init(cursor)
        conn.commit()
        # apply migrations
        with conn.cursor() as cursor:
            migration_exists = check_migration(cursor)
            if migration_exists:
                revision = get_migration_revision(cursor)
            else:
                revision = add_migrations(cursor)
            print('Current revision {}'.format(revision))
            try:
                while revision < len(migrations_sql):
                    print('Applying migration {}'.format(revision))
                    cursor.execute(migrations_sql[revision])
                    revision += 1
            finally:
                set_revision(cursor, revision)
        conn.commit()
    finally:
        conn.close()

if __name__ == '__main__':
    main()