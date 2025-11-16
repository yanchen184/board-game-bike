import { Component } from 'react';
import PropTypes from 'prop-types';
import Button from './ui/Button';
import Card from './ui/Card';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-radial flex items-center justify-center p-4">
          <Card className="max-w-2xl">
            <div className="text-center">
              <div className="text-6xl mb-4">😵</div>
              <h1 className="text-3xl font-bold text-neutral-900 mb-4">糟糕！發生錯誤</h1>
              <p className="text-neutral-600 mb-6">
                遊戲遇到了一些問題。別擔心，你可以重新開始！
              </p>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mb-6 p-4 bg-neutral-100 rounded-lg text-left">
                  <p className="font-mono text-sm text-accent-red mb-2">
                    {this.state.error.toString()}
                  </p>
                  {this.state.errorInfo && (
                    <pre className="text-xs text-neutral-600 overflow-auto max-h-40">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              )}

              <div className="flex gap-4 justify-center">
                <Button onClick={this.handleReset} size="lg">
                  🏠 返回首頁
                </Button>
                <Button variant="secondary" onClick={() => window.location.reload()} size="lg">
                  🔄 重新載入
                </Button>
              </div>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ErrorBoundary;
