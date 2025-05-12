'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Code, Menu, X, Github, Twitter, Facebook, Instagram, Mail, Phone, ChevronRight, GitBranch, Zap, Sparkles, Lock, Download, Apple, MonitorIcon, FileIcon } from 'lucide-react';

// Header Component
function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="w-full py-4 px-4 md:px-8 bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <Code className="h-6 w-6 text-purple-600" />
          <span className="font-bold text-xl">CodePro</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="#features" className="text-gray-700 hover:text-purple-600 transition-colors">
            Features
          </Link>
          <Link href="#download" className="text-gray-700 hover:text-purple-600 transition-colors">
            다운로드
          </Link>
          <Link href="#pricing" className="text-gray-700 hover:text-purple-600 transition-colors">
            가격 정책
          </Link>
          <Link href="#docs" className="text-gray-700 hover:text-purple-600 transition-colors">
            문서
          </Link>
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <Button variant="ghost" className="text-gray-700">
            로그인
          </Button>
          <Button asChild className="bg-purple-600 hover:bg-purple-700 text-white">
            <Link href="/editor">
              시작하기
            </Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden text-gray-700" onClick={toggleMenu}>
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-b border-gray-200 p-4 shadow-lg">
          <nav className="flex flex-col gap-4">
            <Link 
              href="#features" 
              className="text-gray-700 hover:text-purple-600 transition-colors"
              onClick={toggleMenu}
            >
              Features
            </Link>
            <Link 
              href="#download" 
              className="text-gray-700 hover:text-purple-600 transition-colors"
              onClick={toggleMenu}
            >
              다운로드
            </Link>
            <Link 
              href="#pricing" 
              className="text-gray-700 hover:text-purple-600 transition-colors"
              onClick={toggleMenu}
            >
              가격 정책
            </Link>
            <Link 
              href="#docs" 
              className="text-gray-700 hover:text-purple-600 transition-colors"
              onClick={toggleMenu}
            >
              문서
            </Link>
            <div className="flex flex-col gap-2 mt-4">
              <Button variant="ghost" className="text-gray-700 w-full justify-center">
                로그인
              </Button>
              <Button asChild className="bg-purple-600 hover:bg-purple-700 text-white w-full justify-center">
                <Link href="/editor">
                  시작하기
                </Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

// Hero Component
function Hero() {
  return (
    <section className="py-16 md:py-24 px-4 bg-gradient-to-br from-purple-50 to-gray-100 relative overflow-hidden">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="relative z-10">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4 leading-tight">
              코드 작성의 <span className="text-purple-600">새로운 방식</span>을 경험하세요
            </h1>
            <p className="text-xl text-gray-700 mb-8 leading-relaxed">
              더 빠르고, 더 스마트하며, 더 직관적인 코드 에디터로 개발 생산성을 향상시키세요. 
              AI 기반 코드 제안과 함께 코딩 경험을 혁신적으로 바꿔보세요.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild className="px-6 py-3 text-lg bg-purple-600 hover:bg-purple-700 text-white">
                <Link href="/editor">
                  지금 시작하기
                </Link>
              </Button>
              <Button variant="outline" className="px-6 py-3 text-lg border-purple-600 text-purple-600 hover:bg-purple-50">
                데모 보기
              </Button>
              <Button asChild variant="outline" className="px-6 py-3 text-lg border-green-600 text-green-600 hover:bg-green-50 flex items-center gap-2">
                <a href="#download">
                  <Download className="h-5 w-5" />
                  다운로드
                </a>
              </Button>
            </div>
            <div className="mt-8 flex items-center gap-6">
              <div className="flex flex-col">
                <span className="text-3xl font-bold text-purple-600">50만+</span>
                <span className="text-gray-600">활성 사용자</span>
              </div>
              <div className="h-10 w-px bg-gray-300"></div>
              <div className="flex flex-col">
                <span className="text-3xl font-bold text-purple-600">200+</span>
                <span className="text-gray-600">지원 언어</span>
              </div>
              <div className="h-10 w-px bg-gray-300"></div>
              <div className="flex flex-col">
                <span className="text-3xl font-bold text-purple-600">98%</span>
                <span className="text-gray-600">사용자 만족도</span>
              </div>
            </div>
          </div>
          <div className="relative lg:ml-auto">
            <div className="bg-white rounded-lg shadow-2xl p-2 md:p-4 relative z-10">
              <div className="rounded overflow-hidden bg-gray-900">
                <div className="flex items-center gap-2 bg-gray-800 px-4 py-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <div className="text-gray-400 text-sm ml-2">codepro.tsx</div>
                </div>
                <div className="p-4 font-mono text-sm text-gray-300">
                  <div className="text-blue-400">function <span className="text-yellow-300">CodePro</span>() {'{'}</div>
                  <div className="pl-4 text-blue-400">const <span className="text-green-300">features</span> = [</div>
                  <div className="pl-8 text-yellow-300">&quot;AI 코드 자동완성&quot;,</div>
                  <div className="pl-8 text-yellow-300">&quot;실시간 협업&quot;,</div>
                  <div className="pl-8 text-yellow-300">&quot;스마트 리팩토링&quot;,</div>
                  <div className="pl-8 text-yellow-300">&quot;멀티 플랫폼 지원&quot;</div>
                  <div className="pl-4 text-blue-400">];</div>
                  <div className="pl-4 text-pink-400">return <span className="text-purple-300">(</span></div>
                  <div className="pl-8 text-blue-300">&lt;<span className="text-red-300">Editor</span> <span className="text-green-300">theme</span>=<span className="text-yellow-300">&quot;pro&quot;</span> /&gt;</div>
                  <div className="pl-4 text-purple-300">);</div>
                  <div className="text-blue-400">{'}'}</div>
                </div>
              </div>
            </div>
            {/* Background decoration */}
            <div className="absolute -right-12 -top-12 w-64 h-64 bg-purple-200 rounded-full opacity-50 blur-3xl"></div>
            <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-blue-200 rounded-full opacity-50 blur-3xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Service Feature Component
function FeatureCard({ icon: Icon, title, description, image }) {
  return (
    <Card className="border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center gap-4 pb-2">
        <div className="p-2 rounded-full bg-purple-100 text-purple-600">
          <Icon className="h-6 w-6" />
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-gray-600 mb-4">
          {description}
        </CardDescription>
        <div className="rounded-lg overflow-hidden border border-gray-200 mb-4">
          <Image
            src={image}
            alt={title}
            width={500}
            height={300}
            className="w-full h-auto object-cover"
          />
        </div>
      </CardContent>
    </Card>
  );
}

// Services Component
function Services() {
  const features = [
    {
      icon: Zap,
      title: "AI 코드 자동완성",
      description: "개발자의 의도를 이해하는 강력한 AI로 코드 작성 속도를 2배 이상 높여보세요. 맥락을 이해하고 품질 높은 코드를 제안합니다.",
      image: "https://picsum.photos/id/0/500/300",
    },
    {
      icon: GitBranch,
      title: "실시간 협업",
      description: "팀원들과 실시간으로 코드를 작성하고 편집할 수 있습니다. 문서 편집기처럼 쉽고 직관적인 방식으로 협업하세요.",
      image: "https://picsum.photos/id/1/500/300",
    },
    {
      icon: Sparkles,
      title: "스마트 리팩토링",
      description: "클릭 한 번으로 코드를 최적화하고 가독성을 높일 수 있습니다. 코드 냄새를 감지하고 더 나은 패턴을 제안합니다.",
      image: "https://picsum.photos/id/2/500/300",
    },
    {
      icon: Lock,
      title: "멀티 플랫폼 지원",
      description: "Windows, macOS, Linux 등 모든 주요 플랫폼에서 동일한 경험을 제공합니다. 웹 브라우저에서도 사용 가능합니다.",
      image: "https://picsum.photos/id/3/500/300",
    },
  ];

  return (
    <section id="features" className="py-16 md:py-24 px-4 bg-white">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            모든 개발자를 위한 최고의 기능
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            코드프로는 개발자의 생산성과 코드 품질을 향상시키기 위한 모든 기능을 갖추고 있습니다.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}

// Download Component
function DownloadSection() {
  const [os, setOs] = useState('');
  
  useEffect(() => {
    // 사용자의 OS 감지
    const userAgent = window.navigator.userAgent.toLowerCase();
    if (userAgent.indexOf('mac') !== -1) {
      setOs('mac');
    } else if (userAgent.indexOf('win') !== -1) {
      setOs('windows');
    } else if (userAgent.indexOf('linux') !== -1) {
      setOs('linux');
    } else {
      setOs('other');
    }
  }, []);
  
  const getDownloadButtonText = () => {
    switch(os) {
      case 'mac':
        return 'macOS용 다운로드';
      case 'windows':
        return 'Windows용 다운로드';
      case 'linux':
        return 'Linux용 다운로드';
      default:
        return '다운로드';
    }
  };
  
  const getDownloadButtonIcon = () => {
    switch(os) {
      case 'mac':
        return <Apple className="h-5 w-5" />;
      case 'windows':
        return <MonitorIcon className="h-5 w-5" />;
      case 'linux':
        return <FileIcon className="h-5 w-5" />;
      default:
        return <Download className="h-5 w-5" />;
    }
  };
  
  return (
    <section id="download" className="py-16 md:py-24 px-4 bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            CodePro 에디터 다운로드
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            모든 주요 운영체제를 지원합니다. 지금 바로 설치하고 코딩 생산성을 향상시키세요.
          </p>
        </div>
        
        <div className="flex flex-col items-center mb-12">
          <Button className="flex items-center gap-2 px-8 py-6 text-lg bg-purple-600 hover:bg-purple-700 text-white rounded-full mb-4">
            {getDownloadButtonIcon()}
            {getDownloadButtonText()}
          </Button>
          <p className="text-gray-500">버전 1.5.2 • {os === 'mac' ? 'Apple Silicon 및 Intel' : '64-bit'}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                <MonitorIcon className="h-6 w-6" />
              </div>
              <CardTitle>Windows</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-600 mb-4">
                Windows 10 이상 지원
              </CardDescription>
              <ul className="space-y-2 mb-4">
                <li className="flex items-center gap-2">
                  <span className="block w-2 h-2 rounded-full bg-purple-600"></span>
                  <span>사용자 설치 (.exe)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="block w-2 h-2 rounded-full bg-purple-600"></span>
                  <span>포터블 버전 (.zip)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="block w-2 h-2 rounded-full bg-purple-600"></span>
                  <span>Windows Store</span>
                </li>
              </ul>
              <Button className="w-full" variant="outline">다운로드</Button>
            </CardContent>
          </Card>
          
          <Card className="border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <div className="p-2 rounded-full bg-gray-100 text-gray-600">
                <Apple className="h-6 w-6" />
              </div>
              <CardTitle>macOS</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-600 mb-4">
                macOS 12 이상 지원
              </CardDescription>
              <ul className="space-y-2 mb-4">
                <li className="flex items-center gap-2">
                  <span className="block w-2 h-2 rounded-full bg-purple-600"></span>
                  <span>Apple Silicon (.dmg)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="block w-2 h-2 rounded-full bg-purple-600"></span>
                  <span>Intel (.dmg)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="block w-2 h-2 rounded-full bg-purple-600"></span>
                  <span>Mac App Store</span>
                </li>
              </ul>
              <Button className="w-full" variant="outline">다운로드</Button>
            </CardContent>
          </Card>
          
          <Card className="border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <div className="p-2 rounded-full bg-yellow-100 text-yellow-600">
                <FileIcon className="h-6 w-6" />
              </div>
              <CardTitle>Linux</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-600 mb-4">
                주요 배포판 지원
              </CardDescription>
              <ul className="space-y-2 mb-4">
                <li className="flex items-center gap-2">
                  <span className="block w-2 h-2 rounded-full bg-purple-600"></span>
                  <span>deb 패키지</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="block w-2 h-2 rounded-full bg-purple-600"></span>
                  <span>rpm 패키지</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="block w-2 h-2 rounded-full bg-purple-600"></span>
                  <span>AppImage</span>
                </li>
              </ul>
              <Button className="w-full" variant="outline">다운로드</Button>
            </CardContent>
          </Card>
        </div>
        
        <div className="mt-12 p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-xl font-bold mb-4">명령줄로 설치하기</h3>
          <div className="bg-gray-900 text-gray-100 p-4 rounded-md font-mono text-sm overflow-x-auto mb-4">
            <div className="whitespace-pre-wrap">
              {os === 'mac' 
                ? '# Homebrew로 설치\nbrew install codepro\n\n# MacPorts로 설치\nport install codepro' 
                : os === 'linux' 
                  ? '# Ubuntu/Debian\nsudo apt update && sudo apt install codepro\n\n# Fedora/RHEL\nsudo dnf install codepro' 
                  : '# Windows (PowerShell)\nwinget install CodePro'}
            </div>
          </div>
          <p className="text-gray-600">또는 <a href="#" className="text-purple-600 hover:underline">GitHub 저장소</a>에서 직접 소스 코드를 다운로드하고 빌드할 수 있습니다.</p>
        </div>
      </div>
    </section>
  );
}

// Footer Component
function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12 px-4">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Code className="h-6 w-6 text-purple-400" />
              <span className="font-bold text-xl">CodePro</span>
            </div>
            <p className="text-gray-400 mb-6">
              새로운 형식의 코드 에디터를 통해 개발자의 생산성을 향상시키는 솔루션을 제공합니다.
            </p>
            <div className="flex gap-4">
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <Github className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </Link>
            </div>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4">제품</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                  다운로드
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                  가격 정책
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                  기능
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                  업데이트
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4">회사</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                  소개
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                  채용
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                  블로그
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                  연락처
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4">고객센터</h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-purple-400" />
                <span className="text-gray-400">support@codepro.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-purple-400" />
                <span className="text-gray-400">+82 02-123-4567</span>
              </li>
            </ul>
            <div className="mt-6">
              <h4 className="font-medium mb-2">뉴스레터 구독</h4>
              <div className="flex">
                <input
                  type="email"
                  placeholder="이메일 주소"
                  className="px-3 py-2 bg-gray-800 text-white rounded-l-md flex-1 focus:outline-none"
                />
                <Button className="bg-purple-600 hover:bg-purple-700 rounded-l-none">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        <Separator className="my-8 bg-gray-700" />
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-gray-400">
            &copy; {new Date().getFullYear()} CodePro. All rights reserved.
          </div>
          <div className="flex gap-6">
            <Link href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
              서비스 이용약관
            </Link>
            <Link href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
              개인정보 처리방침
            </Link>
            <Link href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
              사이트맵
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main>
        <Hero />
        <Services />
        <DownloadSection />
      </main>
      <Footer />
    </div>
  );
}
