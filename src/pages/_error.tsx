import NoHeaderLayout from '@/layouts/no-header';
import Exception from '@hankliu/rc-exception';
import { Button } from '@hankliu/hankliu-ui';
import router from 'next/router';
import type { ReactElement } from 'react';

function ErrorPage({ statusCode }) {
  return (
    <div className="flex h-[100vh] flex-1 flex-col justify-center">
      <Exception code={statusCode} />
      <div className="mt-12 flex justify-center">
        <Button
          size="large"
          onClick={() => {
            router.push({
              pathname: `/`,
            });
          }}
          type="primary"
        >
          返回首页
        </Button>
      </div>
    </div>
  );
}

// 自定义Layout
ErrorPage.getLayout = function getLayout(page: ReactElement) {
  return <NoHeaderLayout>{page}</NoHeaderLayout>;
};

ErrorPage.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default ErrorPage;
